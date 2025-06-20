//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, expect, test, vi, type Mock } from 'vitest';

import { groupChangedFilesByProject } from '../src/utils/project-analyzer';
import { runStylelint } from '../src/stylelint';
import { runPackageAudit } from '../src/package-audit';
import { runLint } from '../src/lint';
import { incrementAction } from '../src/action';

// Mock shelljs
vi.mock('shelljs', () => ({
  exec: vi.fn().mockReturnValue({ stdout: '', stderr: '' }),
}));

vi.mock('../src/utils/project-analyzer');
vi.mock('../src/lint');
vi.mock('../src/stylelint');
vi.mock('../src/package-audit');
vi.mock('@coze-arch/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

describe('increment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockGroup = { '@coze-infra/rush-x': ['some/file'] };

    (groupChangedFilesByProject as Mock).mockImplementation(files => {
      console.log('groupChangedFilesByProject called with:', files);
      return mockGroup;
    });

    (runLint as Mock).mockImplementation(async args => {
      console.log('runLint called with:', args);
      return Promise.resolve();
    });

    (runStylelint as Mock).mockImplementation(async args => {
      console.log('runStylelint called with:', args);
      return Promise.resolve();
    });

    (runPackageAudit as Mock).mockImplementation(async args => {
      console.log('runPackageAudit called with:', args);
      return Promise.resolve();
    });
  });

  test('should run lint action', async () => {
    const mockFiles = ['some/file'];
    const expectedArg = { '@coze-infra/rush-x': ['some/file'] };

    console.log('=== Starting lint action test ===');

    await incrementAction({
      changedFiles: mockFiles,
      action: 'lint',
      verbose: true,
    });

    expect(runLint).toHaveBeenCalledTimes(1);
    expect(runLint).toHaveBeenCalledWith(expectedArg);
  });

  test('should run style action', async () => {
    const mockFiles = ['some/file'];
    const expectedArg = { '@coze-infra/rush-x': ['some/file'] };
    console.log('Running style action test');
    await incrementAction({
      changedFiles: mockFiles,
      action: 'style',
      verbose: false,
    });
    expect(runStylelint).toHaveBeenCalledWith(expectedArg);
  });

  test('should run package-audit action', async () => {
    const mockFiles = ['some/file'];
    const expectedArg = { '@coze-infra/rush-x': ['some/file'] };
    console.log('Running package-audit action test');
    await incrementAction({
      changedFiles: mockFiles,
      action: 'package-audit',
      verbose: false,
    });
    expect(runPackageAudit).toHaveBeenCalledWith(expectedArg);
  });
});
