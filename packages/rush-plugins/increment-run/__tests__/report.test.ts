import {
  type Mock,
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from 'vitest';

import { isCI } from '../src/utils/env';
import { addReport, CIReportConclusion } from '../src/utils/ci-interactor';
import { report as stylelintReport } from '../src/stylelint/report';
import { report as packageAuditReport } from '../src/package-audit/report';
import { report as lintReport } from '../src/lint/report';

// Mock dependencies
vi.mock('../src/utils/env', () => ({
  isCI: vi.fn(),
}));

vi.mock('../src/utils/ci-interactor', () => ({
  addReport: vi.fn(),
  CIReportConclusion: {
    SUCCESS: 'success',
    FAILED: 'failed',
  },
}));

vi.mock('@coze-arch/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('lint report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should report success when no lint errors', async () => {
    (isCI as Mock).mockReturnValue(true);
    const lintResult: {
      packageName: string;
      diagnostics: string;
      hasError: boolean;
    }[] = [];

    await lintReport(lintResult);

    expect(addReport).toHaveBeenCalledWith({
      name: 'ESLint Detect',
      conclusion: CIReportConclusion.SUCCESS,
      output: {
        summary: '',
        description: '',
      },
    });
  });

  it('should report failure with lint errors', async () => {
    (isCI as Mock).mockReturnValue(true);
    process.env.targetBranch = 'main';

    const lintResult = [
      {
        packageName: '@test/package',
        diagnostics: 'Error: some lint error',
        hasError: true,
      },
    ];

    await lintReport(lintResult);

    expect(addReport).toHaveBeenCalledWith({
      name: 'ESLint Detect',
      conclusion: CIReportConclusion.FAILED,
      output: {
        summary: expect.stringContaining('❌ ESLint Detect'),
      },
    });
  });
});

describe('package-audit report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should report success when no audit issues', async () => {
    (isCI as Mock).mockReturnValue(true);
    const diagnostics = [];

    await packageAuditReport(diagnostics);

    expect(addReport).toHaveBeenCalledWith({
      name: 'Package Audit Checker',
      conclusion: CIReportConclusion.SUCCESS,
      output: {
        summary: expect.stringContaining(''),
      },
    });
  });

  it('should report failure with error level issues', async () => {
    (isCI as Mock).mockReturnValue(true);
    process.env.targetBranch = 'main';

    const diagnostics = [
      {
        level: 'error',
        packageName: '@test/package',
        rule: 'no-vulnerabilities',
        content: 'Found security vulnerability',
      },
    ];

    await packageAuditReport(diagnostics);

    expect(addReport).toHaveBeenCalledWith({
      name: 'Package Audit Checker',
      conclusion: CIReportConclusion.FAILED,
      output: {
        summary: expect.stringContaining('❌ Package Audit Checker'),
      },
    });
  });
});

describe('stylelint report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should report success when no style errors', async () => {
    (isCI as Mock).mockReturnValue(true);
    const results = [];

    await stylelintReport(results, 'Stylelint Check');

    expect(addReport).toHaveBeenCalledWith({
      name: 'Stylelint Check',
      conclusion: CIReportConclusion.SUCCESS,
      output: {
        summary: '',
        description: '',
      },
    });
  });

  it('should report failure with style errors', async () => {
    (isCI as Mock).mockReturnValue(true);
    process.env.targetBranch = 'main';

    const results = [
      {
        errors: [
          {
            source: 'style.css',
            warnings: [
              {
                line: 1,
                column: 1,
                severity: 'error',
                text: 'Invalid property',
                rule: 'property-no-unknown',
              },
            ],
          },
        ],
        files: ['style.css'],
        projectFolder: '/test',
        packageName: '@test/package',
      },
    ];

    await stylelintReport(results, 'Stylelint Check');

    expect(addReport).toHaveBeenCalledWith({
      name: 'Stylelint Check',
      conclusion: CIReportConclusion.FAILED,
      output: {
        summary: expect.stringContaining('❌ Stylelint Detect Result'),
      },
    });
  });
});
