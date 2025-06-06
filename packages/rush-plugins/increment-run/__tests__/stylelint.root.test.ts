import { runStylelint } from '../src/stylelint';

vi.mock('../src/stylelint/stylelint', () => ({ runLintInProject: vi.fn() }));
vi.mock('../src/stylelint/report', () => ({ report: vi.fn() }));
vi.mock('@coze-arch/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));
vi.mock('path', () => ({ default: { relative: vi.fn() } }));

vi.mock('@coze-arch/monorepo-kits', () => ({
  getRushConfiguration: vi.fn(() => ({
    rushJsonFolder: 'path/to/rushJsonFolder',
    getProjectByName: vi.fn(packageName => ({
      packageName,
      projectFolder: `/path/to/${packageName}`,
      projectRelativeFolder: packageName,
    })),
  })),
  lookupOnly: vi.fn().mockResolvedValue({
    packageName: 'foo',
    projectFolder: '/path/to/foo',
    projectRelativeFolder: 'foo',
  }),
}));

describe('increment run stylelint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should batch run stylelint', async () => {
    const { runLintInProject } = await import('../src/stylelint/stylelint');
    const { report } = await import('../src/stylelint/report');
    const path = await import('path');

    const changedFileGroup = {
      foo: ['src/file.less', 'src/file2.less'],
      bar: ['src/file3.less', 'src/file4.less'],
      bar2: ['src/file3.js'],
    };

    vi.mocked(path.default.relative).mockImplementation((_, r) => r);
    vi.mocked(runLintInProject).mockResolvedValueOnce([
      {
        warnings: [
          {
            text: 'error',
            line: 1,
            column: 1,
            rule: 'test-rule',
            severity: 'error' as const,
          },
        ],
        deprecations: [],
        invalidOptionWarnings: [],
        parseErrors: [],
        errored: false,
        source: 'test-source',
      },
    ]);
    vi.mocked(runLintInProject).mockResolvedValueOnce([]);

    await runStylelint(changedFileGroup);

    // assets
    expect(vi.mocked(report).mock.calls[0][0]).toEqual([
      {
        packageName: 'foo',
        errors: [
          {
            warnings: [
              {
                text: 'error',
                line: 1,
                column: 1,
                rule: 'test-rule',
                severity: 'error',
              },
            ],
            deprecations: [],
            invalidOptionWarnings: [],
            parseErrors: [],
            errored: false,
            source: 'test-source',
          },
        ],
        files: ['src/file.less', 'src/file2.less'],
        projectFolder: '/path/to/foo',
      },
      {
        packageName: 'bar',
        errors: [],
        files: ['src/file3.less', 'src/file4.less'],
        projectFolder: '/path/to/bar',
      },
    ]);
    expect(vi.mocked(runLintInProject).mock.calls.length).toBe(2);
  });
});
