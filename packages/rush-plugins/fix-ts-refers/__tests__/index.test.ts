//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';

import { vi, type Mock } from 'vitest';

// Mock 所有外部依赖模块
vi.mock('shelljs', () => ({
  exec: vi.fn(),
}));

vi.mock('commander', () => {
  const mockCommand = {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    command: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parse: vi.fn(),
  };
  return {
    Command: vi.fn().mockImplementation(() => mockCommand),
    mockCommand,
  };
});

vi.mock('@coze-arch/monorepo-kits', () => ({
  getRushConfiguration: vi.fn(),
}));

vi.mock('@coze-arch/fs-enhance', () => ({
  readJsonFile: vi.fn(),
}));

vi.mock('../src/ts-config', () => ({
  TsConfigRepairer: vi.fn().mockImplementation(() => ({
    run: vi.fn(),
  })),
}));

vi.mock('path', () => ({
  default: {
    resolve: vi.fn(),
  },
}));

// 导入 mocked 版本的模块
import { exec } from 'shelljs';
import { Command } from 'commander';
import { getRushConfiguration } from '@coze-arch/monorepo-kits';
import { readJsonFile } from '@coze-arch/fs-enhance';

import { TsConfigRepairer } from '../src/ts-config';

describe('index module', () => {
  const mockRushConfig = {
    rushJsonFolder: '/path/to/project',
  };

  const mockPackageJson = {
    name: '@coze-arch/rush-fix-ts-refers-plugin',
    version: '1.0.0',
    description: 'TypeScript references fixer for Rush monorepo',
  };

  let mockCommand: any;
  let mockTsConfigRepairer: any;
  let originalArgv: string[];

  beforeEach(() => {
    vi.clearAllMocks();

    // 保存原始的 process.argv
    originalArgv = process.argv;
    process.argv = ['node', 'index.js'];

    // Mock commander
    mockCommand = {
      name: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      command: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
      parse: vi.fn(),
    };
    (Command as Mock).mockImplementation(() => mockCommand);

    // Mock TsConfigRepairer
    mockTsConfigRepairer = {
      run: vi.fn(),
    };
    (TsConfigRepairer as Mock).mockImplementation(() => mockTsConfigRepairer);

    // Mock other dependencies
    (getRushConfiguration as Mock).mockReturnValue(mockRushConfig);
    (readJsonFile as Mock).mockResolvedValue(mockPackageJson);
    (path.resolve as Mock).mockImplementation((...args) => args.join('/'));
  });

  afterEach(() => {
    // 恢复原始的 process.argv
    process.argv = originalArgv;
    vi.resetModules();
  });

  describe('main function and command setup', () => {
    it('should setup commander with correct configuration', async () => {
      await import('../src/index');

      expect(Command).toHaveBeenCalled();
      expect(mockCommand.name).toHaveBeenCalledWith(mockPackageJson.name);
      expect(mockCommand.description).toHaveBeenCalledWith(
        mockPackageJson.description,
      );
      expect(mockCommand.command).toHaveBeenCalledWith('fix');
    });

    it('should configure all command options correctly', async () => {
      await import('../src/index');

      expect(mockCommand.option).toHaveBeenCalledWith(
        '-p, --package <package>',
        '需要执行操作的子项目名称，要求必须在 rush.json 中配置的项',
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        '-c, --use-cached-files',
        '发生变更的文件列表，fix 命令会根据这份列表做自动格式化',
        false,
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        '-s, --submit-changes',
        '是否自动提交变更，建议仅在 pre-commit hooks 使用',
        false,
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        '--shallow',
        '是否禁用递归处理逻辑，只对顶层包做修复',
        false,
      );
    });

    it('should call parse with process.argv', async () => {
      process.argv = ['node', 'script.js', 'fix', '--package', 'test'];

      await import('../src/index');

      expect(mockCommand.parse).toHaveBeenCalledWith(process.argv);
    });
  });

  describe('executeFixCommand functionality', () => {
    let executeCallback: Function;

    beforeEach(async () => {
      await import('../src/index');
      // 获取 action 方法的回调函数
      const actionCalls = mockCommand.action.mock.calls;
      if (actionCalls.length > 0) {
        executeCallback = actionCalls[0][0];
      }
    });

    it('should create TsConfigRepairer with correct options', async () => {
      const options = {
        package: 'test-package',
        useCachedFiles: false,
        submitChanges: true,
        shallow: false,
      };

      if (executeCallback) {
        await executeCallback(options);
      }

      expect(TsConfigRepairer).toHaveBeenCalledWith({
        packageName: 'test-package',
        changedFiles: undefined,
        recursivelyFix: true,
        submitChanges: true,
      });
      expect(mockTsConfigRepairer.run).toHaveBeenCalled();
    });

    it('should use cached files when useCachedFiles is true', async () => {
      const gitOutput = 'package.json\nsrc/index.ts\n';
      (exec as Mock).mockReturnValue(gitOutput);

      const options = {
        package: 'test-package',
        useCachedFiles: true,
        submitChanges: false,
        shallow: true,
      };

      if (executeCallback) {
        await executeCallback(options);
      }

      expect(exec).toHaveBeenCalledWith(
        'git diff --name-only --diff-filter=ACMR --cached',
        {
          silent: true,
          cwd: '/path/to/project',
        },
      );
      expect(TsConfigRepairer).toHaveBeenCalledWith({
        packageName: 'test-package',
        changedFiles: ['package.json', 'src/index.ts'],
        recursivelyFix: false,
        submitChanges: false,
      });
    });

    it('should handle undefined package name', async () => {
      const options = {
        useCachedFiles: false,
        submitChanges: false,
        shallow: false,
      };

      if (executeCallback) {
        await executeCallback(options);
      }

      expect(TsConfigRepairer).toHaveBeenCalledWith({
        packageName: undefined,
        changedFiles: undefined,
        recursivelyFix: true,
        submitChanges: false,
      });
    });

    it('should filter empty lines from git output', async () => {
      const gitOutput = 'package.json\n\nsrc/index.ts\n\n\n';
      (exec as Mock).mockReturnValue(gitOutput);

      const options = {
        useCachedFiles: true,
        submitChanges: false,
        shallow: false,
      };

      if (executeCallback) {
        await executeCallback(options);
      }

      expect(TsConfigRepairer).toHaveBeenCalledWith({
        packageName: undefined,
        changedFiles: ['package.json', 'src/index.ts'],
        recursivelyFix: true,
        submitChanges: false,
      });
    });

    it('should handle git command failure gracefully', async () => {
      (exec as Mock).mockImplementation(() => {
        throw new Error('Git command failed');
      });

      const options = {
        useCachedFiles: true,
        submitChanges: false,
        shallow: false,
      };

      if (executeCallback) {
        await expect(executeCallback(options)).rejects.toThrow(
          'Git command failed',
        );
      }
    });

    it('should handle TsConfigRepairer.run() failure', async () => {
      mockTsConfigRepairer.run.mockRejectedValue(new Error('Repair failed'));

      const options = {
        package: 'test-package',
        useCachedFiles: false,
        submitChanges: false,
        shallow: false,
      };

      if (executeCallback) {
        await expect(executeCallback(options)).rejects.toThrow('Repair failed');
      }
    });

    it('should handle empty git output when using cached files', async () => {
      (exec as Mock).mockReturnValue('');

      const options = {
        useCachedFiles: true,
        submitChanges: false,
        shallow: false,
      };

      if (executeCallback) {
        await executeCallback(options);
      }

      expect(TsConfigRepairer).toHaveBeenCalledWith({
        packageName: undefined,
        changedFiles: [],
        recursivelyFix: true,
        submitChanges: false,
      });
    });

    it('should trim whitespace from file paths', async () => {
      const gitOutput =
        '  package.json  \n\t src/index.ts \t\n  src/utils.ts\n';
      (exec as Mock).mockReturnValue(gitOutput);

      const options = {
        useCachedFiles: true,
        submitChanges: false,
        shallow: false,
      };

      if (executeCallback) {
        await executeCallback(options);
      }

      expect(TsConfigRepairer).toHaveBeenCalledWith({
        packageName: undefined,
        changedFiles: ['package.json', 'src/index.ts', 'src/utils.ts'],
        recursivelyFix: true,
        submitChanges: false,
      });
    });

    it('should handle getRushConfiguration error when using cached files', async () => {
      (getRushConfiguration as Mock).mockImplementation(() => {
        throw new Error('Rush configuration error');
      });

      const options = {
        useCachedFiles: true,
        submitChanges: false,
        shallow: false,
      };

      if (executeCallback) {
        await expect(executeCallback(options)).rejects.toThrow(
          'Rush configuration error',
        );
      }
    });
  });

  describe('command line option types', () => {
    let executeCallback: Function;

    beforeEach(async () => {
      await import('../src/index');
      const actionCalls = mockCommand.action.mock.calls;
      if (actionCalls.length > 0) {
        executeCallback = actionCalls[0][0];
      }
    });

    it('should accept valid FixOptions structure', async () => {
      const validOptions = {
        package: 'test-package',
        useCachedFiles: true,
        submitChanges: true,
        shallow: false,
      };

      await expect(executeCallback(validOptions)).resolves.not.toThrow();
    });

    it('should handle boolean option variations', async () => {
      const testCases = [
        { useCachedFiles: true, submitChanges: true, shallow: true },
        { useCachedFiles: false, submitChanges: false, shallow: false },
        { useCachedFiles: true, submitChanges: false, shallow: true },
        { useCachedFiles: false, submitChanges: true, shallow: false },
      ];

      for (const options of testCases) {
        await expect(executeCallback(options)).resolves.not.toThrow();
      }
    });
  });

  describe('integration scenarios', () => {
    let executeCallback: Function;

    beforeEach(async () => {
      await import('../src/index');
      const actionCalls = mockCommand.action.mock.calls;
      if (actionCalls.length > 0) {
        executeCallback = actionCalls[0][0];
      }
    });

    it('should handle complete workflow with cached files and submit changes', async () => {
      const gitOutput =
        'packages/test/tsconfig.json\npackages/test/src/index.ts\n';
      (exec as Mock).mockReturnValue(gitOutput);

      const options = {
        package: 'test-package',
        useCachedFiles: true,
        submitChanges: true,
        shallow: false,
      };

      await executeCallback(options);

      expect(exec).toHaveBeenCalledWith(
        'git diff --name-only --diff-filter=ACMR --cached',
        { silent: true, cwd: '/path/to/project' },
      );
      expect(TsConfigRepairer).toHaveBeenCalledWith({
        packageName: 'test-package',
        changedFiles: [
          'packages/test/tsconfig.json',
          'packages/test/src/index.ts',
        ],
        recursivelyFix: true,
        submitChanges: true,
      });
      expect(mockTsConfigRepairer.run).toHaveBeenCalled();
    });

    it('should handle shallow fix without cached files', async () => {
      const options = {
        package: 'single-package',
        useCachedFiles: false,
        submitChanges: false,
        shallow: true,
      };

      await executeCallback(options);

      expect(exec).not.toHaveBeenCalled();
      expect(TsConfigRepairer).toHaveBeenCalledWith({
        packageName: 'single-package',
        changedFiles: undefined,
        recursivelyFix: false,
        submitChanges: false,
      });
    });
  });

  describe('error recovery', () => {
    let executeCallback: Function;

    beforeEach(async () => {
      await import('../src/index');
      const actionCalls = mockCommand.action.mock.calls;
      if (actionCalls.length > 0) {
        executeCallback = actionCalls[0][0];
      }
    });

    it('should propagate TsConfigRepairer errors', async () => {
      mockTsConfigRepairer.run.mockRejectedValue(
        new Error('Configuration error'),
      );

      await expect(executeCallback({})).rejects.toThrow('Configuration error');
    });

    it('should handle async errors in executeCallback', async () => {
      (getRushConfiguration as Mock).mockImplementation(() => {
        throw new Error('Async configuration error');
      });

      const options = {
        useCachedFiles: true,
        submitChanges: false,
        shallow: false,
      };
      await expect(executeCallback(options)).rejects.toThrow(
        'Async configuration error',
      );
    });
  });

  describe('file utilities', () => {
    it('should read package.json from correct path', async () => {
      await import('../src/index');

      expect(path.resolve).toHaveBeenCalledWith(
        expect.any(String),
        '../package.json',
      );
      expect(readJsonFile).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
      );
    });

    it('should return package.json content with correct structure', async () => {
      const customPackageJson = {
        name: 'test-package',
        version: '2.0.0',
        description: 'Test description',
      };
      (readJsonFile as Mock).mockResolvedValue(customPackageJson);

      await import('../src/index');

      expect(readJsonFile).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('git operations', () => {
    let executeCallback: Function;

    beforeEach(async () => {
      await import('../src/index');
      const actionCalls = mockCommand.action.mock.calls;
      if (actionCalls.length > 0) {
        executeCallback = actionCalls[0][0];
      }
    });

    it('should call git with correct parameters', async () => {
      const gitOutput = 'file1.ts\nfile2.ts\n';
      (exec as Mock).mockReturnValue(gitOutput);

      const options = {
        useCachedFiles: true,
        submitChanges: false,
        shallow: false,
      };
      await executeCallback(options);

      expect(exec).toHaveBeenCalledWith(
        'git diff --name-only --diff-filter=ACMR --cached',
        {
          silent: true,
          cwd: '/path/to/project',
        },
      );
    });

    it('should handle git output with various line endings', async () => {
      const gitOutput = 'file1.ts\r\nfile2.ts\r\n\rfile3.ts\n';
      (exec as Mock).mockReturnValue(gitOutput);

      const options = {
        useCachedFiles: true,
        submitChanges: false,
        shallow: false,
      };
      await executeCallback(options);

      expect(TsConfigRepairer).toHaveBeenCalledWith(
        expect.objectContaining({
          changedFiles: expect.arrayContaining([
            'file1.ts',
            'file2.ts',
            'file3.ts',
          ]),
        }),
      );
    });

    it('should skip git operations when useCachedFiles is false', async () => {
      const options = {
        useCachedFiles: false,
        submitChanges: false,
        shallow: false,
      };
      await executeCallback(options);

      expect(exec).not.toHaveBeenCalled();
      expect(TsConfigRepairer).toHaveBeenCalledWith(
        expect.objectContaining({
          changedFiles: undefined,
        }),
      );
    });
  });
});
