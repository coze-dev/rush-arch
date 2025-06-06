import { describe, expect, test, vi } from 'vitest';

import { groupChangedFilesByProject } from '../src/utils/project-analyzer';
import { runStylelint } from '../src/stylelint';
import { runPackageAudit } from '../src/package-audit';
import { runLint } from '../src/lint';
import { incrementAction } from '../src/action';

// Mock shelljs
vi.mock('shelljs', () => ({
  exec: vi.fn().mockReturnValue({ stdout: '', stderr: '' }),
}));

vi.mock('../../../utils/project-analyzer');
vi.mock('../lint');
vi.mock('../stylelint');
vi.mock('../ts-check');
vi.mock('../package-audit');
vi.mock('../../../utils/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

describe('increment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockGroup = { '@coze-infra/rush-x': ['some/file'] };

    vi.mocked(groupChangedFilesByProject).mockImplementation(files => {
      console.log('groupChangedFilesByProject called with:', files);
      return mockGroup;
    });

    vi.mocked(runLint).mockImplementation(async args => {
      console.log('runLint called with:', args);
      return Promise.resolve();
    });

    vi.mocked(runStylelint).mockImplementation(async args => {
      console.log('runStylelint called with:', args);
      return Promise.resolve();
    });

    vi.mocked(runPackageAudit).mockImplementation(async args => {
      console.log('runPackageAudit called with:', args);
      return Promise.resolve();
    });
  });

  test('should run lint action', async () => {
    const mockFiles = ['some/file'];
    const expectedArg = { '@coze-infra/rush-x': mockFiles };

    console.log('=== Starting lint action test ===');
    console.log('Mock state before test:', {
      groupChangedFilesByProject: vi.mocked(groupChangedFilesByProject).mock
        .calls,
      runLint: vi.mocked(runLint).mock.calls,
    });

    await incrementAction({
      changedFiles: mockFiles,
      action: 'lint',
      verbose: true,
    });

    console.log('Mock state after test:', {
      groupChangedFilesByProject: vi.mocked(groupChangedFilesByProject).mock
        .calls,
      runLint: vi.mocked(runLint).mock.calls,
    });

    expect(runLint).toHaveBeenCalledTimes(1);
    expect(runLint).toHaveBeenCalledWith(expectedArg);
  });

  test('should run style action', async () => {
    const mockFiles = ['some/file'];
    const expectedArg = { '@coze-infra/rush-x': mockFiles };
    console.log('Running style action test');
    await incrementAction({
      changedFiles: mockFiles,
      action: 'lint',
      verbose: false,
    });
    expect(runStylelint).toHaveBeenCalledWith(expectedArg);
  });

  test('should run package-audit action', async () => {
    const mockFiles = ['some/file'];
    const expectedArg = { '@coze-infra/rush-x': mockFiles };
    console.log('Running package-audit action test');
    await incrementAction({
      changedFiles: mockFiles,
      action: 'package-audit',
      verbose: false,
    });
    expect(runPackageAudit).toHaveBeenCalledWith(expectedArg);
  });
});
