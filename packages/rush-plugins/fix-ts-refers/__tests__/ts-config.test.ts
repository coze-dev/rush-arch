//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { writeFile } from 'fs/promises';

import { vi, type Mock } from 'vitest';
import { exec } from 'shelljs';
import {
  lookupProjectsByFiles,
  getRushConfiguration,
  lookupOnly,
} from '@coze-arch/monorepo-kits';
import { logger } from '@coze-arch/logger';
import { isFileExists, readJsonFile } from '@coze-arch/fs-enhance';

import { TsConfigRepairer } from '../src/ts-config';
import { format } from '../src/prettier';

// Mock 所有外部依赖模块
vi.mock('@coze-arch/fs-enhance', () => ({
  isFileExists: vi.fn(),
  readJsonFile: vi.fn(),
}));

vi.mock('../src/prettier', () => ({ format: vi.fn() }));

vi.mock('@coze-arch/monorepo-kits', () => ({
  getRushConfiguration: vi.fn(),
  lookupProjectsByFiles: vi.fn(),
  lookupOnly: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
}));

vi.mock('shelljs', () => ({
  exec: vi.fn(),
}));

vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('TsConfigRepairer', () => {
  const mockProject = {
    packageName: 'test-package',
    projectFolder: '/path/to/package',
    dependencyProjects: [
      {
        packageName: 'sub-package',
        projectFolder: '/path/to/sub-package',
        dependencyProjects: [],
      },
    ],
  };

  const mockRushConfig = {
    projects: [mockProject],
    rushJsonFolder: '/path/to/rush',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    (getRushConfiguration as Mock).mockReturnValue(mockRushConfig);
    (lookupOnly as Mock).mockReturnValue(mockProject);
    (format as Mock).mockResolvedValue('formatted content');
  });

  describe('constructor', () => {
    it('should create repairer with default options', () => {
      const repairer = new TsConfigRepairer({});
      expect(repairer).toBeDefined();
    });

    it('should create repairer with custom options', () => {
      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: true,
        recursivelyFix: false,
        changedFiles: ['test.ts'],
      });
      expect(repairer).toBeDefined();
    });
  });

  describe('run method', () => {
    it('should process special project success', async () => {
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        name: 'fake tsconfig file',
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(format).toBeCalledTimes(1);
      expect((format as Mock).mock.calls[0][1]).toEqual(
        '/path/to/package/tsconfig.build.json',
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Find 1 packages to be fix tsconfig.',
      );
      expect(logger.success).toHaveBeenCalledWith('process success');
    });

    it('should skip if tsconfig.json missing', async () => {
      (isFileExists as Mock).mockResolvedValue(false);

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(format).not.toBeCalled();
      expect(readJsonFile).not.toBeCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Skip test-package because tsconfig file missing.',
      );
    });

    it('should create build config file if missing', async () => {
      (isFileExists as Mock).mockImplementation(f =>
        Promise.resolve(f.endsWith('tsconfig.build.json') ? false : true),
      );
      (readJsonFile as Mock).mockResolvedValue({
        name: 'fake tsconfig file',
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(readJsonFile).toBeCalledTimes(3);
      expect(format).toBeCalledTimes(2);
      expect(writeFile).toBeCalledTimes(2);
    });

    it('should fully fix build config', async () => {
      (isFileExists as Mock).mockImplementation(f =>
        Promise.resolve(f.endsWith('tsconfig.build.json') ? false : true),
      );
      (readJsonFile as Mock).mockResolvedValue({
        name: 'fake tsconfig file',
        compilerOptions: {
          outDir: 'test',
        },
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(format).toBeCalledTimes(3);
      expect(writeFile).toBeCalledTimes(3);
      expect(
        (writeFile as Mock).mock.calls[0][0].endsWith('tsconfig.build.json'),
      ).toBeTruthy();
      expect(JSON.parse((format as Mock).mock.calls[1][0])).toMatchObject({
        compilerOptions: { tsBuildInfoFile: 'test/tsconfig.build.tsbuildinfo' },
      });
    });

    it('should call git add when submitChanges is true', async () => {
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        name: 'fake tsconfig file',
        compilerOptions: {
          outDir: 'test',
        },
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: true,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(exec).toBeCalledTimes(2);
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining('git add'),
        expect.objectContaining({
          silent: true,
          async: true,
          cwd: '/path/to/rush',
        }),
      );
    });

    it('should recursively fix sub packages', async () => {
      const projectWithDeps = {
        packageName: 'test-package',
        projectFolder: '/path/to/package',
        dependencyProjects: [
          {
            projectFolder: '/path/to/sub-package2',
            packageName: 'foo',
            dependencyProjects: [],
          },
          {
            projectFolder: '/path/to/sub-package3',
            dependencyProjects: [],
            packageName: 'test-sub-package',
          },
        ],
      };
      (getRushConfiguration as Mock).mockReturnValue({
        projects: [projectWithDeps],
        rushJsonFolder: '/path/to/rush',
      });
      (lookupOnly as Mock).mockReturnValue(projectWithDeps);
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        name: 'fake tsconfig file',
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });

      const repairer = new TsConfigRepairer({
        submitChanges: false,
        recursivelyFix: true,
        packageName: 'test-package',
      });
      await repairer.run();

      expect(writeFile).toBeCalledTimes(1);
    });

    it('should process all projects when no packageName specified', async () => {
      const multipleProjects = {
        projects: [
          {
            packageName: 'test-package',
            projectFolder: '/path/to/package',
            dependencyProjects: [
              {
                packageName: 'sub-package',
                projectFolder: '/path/to/sub-package',
                dependencyProjects: [],
              },
              {
                projectFolder: '/path/to/sub-package2',
                packageName: 'foo',
                dependencyProjects: [],
              },
              {
                projectFolder: '/path/to/sub-package3',
                dependencyProjects: [],
                packageName: 'test-sub-package',
              },
            ],
          },
          {
            packageName: 'test-package2',
            projectFolder: '/path/to/package2',
            dependencyProjects: [
              {
                packageName: 'sub-package',
                projectFolder: '/path/to/sub-package',
                dependencyProjects: [],
              },
            ],
          },
          {
            packageName: 'test-package3',
            projectFolder: '/path/to/package3',
            dependencyProjects: [],
          },
        ],
        rushJsonFolder: '/path/to/rush',
      };
      (getRushConfiguration as Mock).mockReturnValue(multipleProjects);
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        name: 'fake tsconfig file',
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });

      const repairer = new TsConfigRepairer({
        submitChanges: true,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(format).toBeCalledTimes(2);
      expect((format as Mock).mock.calls[0][1]).toEqual(
        '/path/to/package/tsconfig.build.json',
      );
      expect((format as Mock).mock.calls[1][1]).toEqual(
        '/path/to/package2/tsconfig.build.json',
      );
    });

    it('should throw if package not found', async () => {
      (getRushConfiguration as Mock).mockReturnValue({
        projects: [],
        rushJsonFolder: '/path/to/rush',
      });
      (lookupOnly as Mock).mockImplementation(() => {
        throw new Error('Package not found');
      });

      const repairer = new TsConfigRepairer({
        submitChanges: false,
        packageName: 'test-package',
        recursivelyFix: false,
      });
      await expect(() => repairer.run()).rejects.toThrow();
      expect(format).not.toBeCalled();
    });

    it('should handle changed files by looking up projects', async () => {
      (lookupProjectsByFiles as Mock).mockReturnValue([
        {
          packageName: 'test-package',
          projectFolder: '/path/to/package',
          dependencyProjects: [
            {
              projectFolder: '/path/to/sub-package',
              packageName: 'test-package2',
              dependencyProjects: [],
            },
          ],
        },
      ]);
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        name: 'fake tsconfig file',
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });

      const repairer = new TsConfigRepairer({
        submitChanges: false,
        changedFiles: ['test/package.json', 'test/foo.ts'],
        recursivelyFix: false,
      });
      await repairer.run();
      expect(format).toBeCalledTimes(1);
      expect(lookupProjectsByFiles).toBeCalledWith(['test/package.json']);
    });

    it('should handle empty changed files list', async () => {
      (getRushConfiguration as Mock).mockReturnValue({
        projects: [],
        rushJsonFolder: '/path/to/rush',
      });

      const repairer = new TsConfigRepairer({
        submitChanges: false,
        changedFiles: ['test/foo.ts'],
        recursivelyFix: false,
      });
      await repairer.run();

      expect(lookupProjectsByFiles).not.toBeCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Find 0 packages to be fix tsconfig.',
      );
    });

    it('should handle both packageName and changedFiles', async () => {
      (lookupProjectsByFiles as Mock).mockReturnValue([
        {
          packageName: 'changed-package',
          projectFolder: '/path/to/changed-package',
          dependencyProjects: [],
        },
      ]);
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        name: 'fake tsconfig file',
        compilerOptions: {},
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        changedFiles: ['test/package.json'],
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(lookupOnly).toHaveBeenCalledWith('test-package');
      expect(lookupProjectsByFiles).toHaveBeenCalledWith(['test/package.json']);
      expect(format).toBeCalledTimes(2);
    });
  });

  describe('ensureTsBuildConfig method', () => {
    it('should create tsconfig.build.json with default outDir when missing', async () => {
      (isFileExists as Mock).mockImplementation(f =>
        Promise.resolve(f.endsWith('tsconfig.build.json') ? false : true),
      );
      (readJsonFile as Mock).mockResolvedValue({
        compilerOptions: {},
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      const formatCalls = (format as Mock).mock.calls;
      const buildConfigCall = formatCalls.find(call =>
        call[1].endsWith('tsconfig.build.json'),
      );
      expect(buildConfigCall).toBeDefined();

      const config = JSON.parse(buildConfigCall![0]);
      expect(config.compilerOptions.outDir).toBe('./lib-ts');
      expect(config.compilerOptions.tsBuildInfoFile).toBe(
        './lib-ts/tsconfig.build.tsbuildinfo',
      );
    });

    it('should filter out vitest/globals from types', async () => {
      (isFileExists as Mock).mockImplementation(f =>
        Promise.resolve(f.endsWith('tsconfig.build.json') ? false : true),
      );
      (readJsonFile as Mock).mockResolvedValue({
        compilerOptions: {
          types: ['node', 'vitest/globals', 'jest'],
        },
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      const formatCalls = (format as Mock).mock.calls;
      const buildConfigCall = formatCalls.find(call =>
        call[1].endsWith('tsconfig.build.json'),
      );
      expect(buildConfigCall).toBeDefined();
      const config = JSON.parse(buildConfigCall![0]);
      expect(config.compilerOptions.types).toEqual(['node', 'jest']);
    });
  });

  describe('fixTsInfo method', () => {
    it('should fix missing tsBuildInfoFile', async () => {
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock)
        .mockResolvedValueOnce({
          compilerOptions: {}, // tsconfig.build.json 没有 tsBuildInfoFile
        })
        .mockResolvedValueOnce({
          compilerOptions: { outDir: 'dist' }, // tsconfig.json 有 outDir
        });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(format).toBeCalledTimes(2); // fixTsInfo 一次，fixTsReferences 一次（因为有依赖项目）
      const firstFormatCall = (format as Mock).mock.calls[0];
      const config = JSON.parse(firstFormatCall[0]);
      expect(config.compilerOptions.tsBuildInfoFile).toBe(
        'dist/tsconfig.build.tsbuildinfo',
      );
    });

    it('should use outDir from main tsconfig when build config missing outDir', async () => {
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock)
        .mockResolvedValueOnce({
          compilerOptions: {}, // tsconfig.build.json 没有 outDir 和 tsBuildInfoFile
        })
        .mockResolvedValueOnce({
          compilerOptions: { outDir: 'main-out' }, // tsconfig.json 有 outDir
        });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      const formatCalls = (format as Mock).mock.calls;
      expect(formatCalls).toHaveLength(2); // fixTsInfo 一次，fixTsReferences 一次（因为有依赖项目）
      const config = JSON.parse(formatCalls[0][0]);
      expect(config.compilerOptions.tsBuildInfoFile).toBe(
        'main-out/tsconfig.build.tsbuildinfo',
      );
    });
  });

  describe('fixTsReferences method', () => {
    it('should sort references alphabetically', async () => {
      const projectWithMultipleDeps = {
        packageName: 'test-package',
        projectFolder: '/path/to/package',
        dependencyProjects: [
          {
            packageName: 'zebra-package',
            projectFolder: '/path/to/zebra-package',
            dependencyProjects: [],
          },
          {
            packageName: 'alpha-package',
            projectFolder: '/path/to/alpha-package',
            dependencyProjects: [],
          },
          {
            packageName: 'beta-package',
            projectFolder: '/path/to/beta-package',
            dependencyProjects: [],
          },
        ],
      };
      (getRushConfiguration as Mock).mockReturnValue({
        projects: [projectWithMultipleDeps],
        rushJsonFolder: '/path/to/rush',
      });
      (lookupOnly as Mock).mockReturnValue(projectWithMultipleDeps);
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      const formatCalls = (format as Mock).mock.calls;
      const referencesCall = formatCalls[formatCalls.length - 1];
      const config = JSON.parse(referencesCall[0]);

      const paths = config.references.map(r => r.path);
      expect(paths).toEqual([
        '../alpha-package/tsconfig.build.json',
        '../beta-package/tsconfig.build.json',
        '../zebra-package/tsconfig.build.json',
      ]);
    });

    it('should handle empty dependency projects', async () => {
      const projectNoDeps = {
        packageName: 'test-package',
        projectFolder: '/path/to/package',
        dependencyProjects: [],
      };
      (getRushConfiguration as Mock).mockReturnValue({
        projects: [projectNoDeps],
        rushJsonFolder: '/path/to/rush',
      });
      (lookupOnly as Mock).mockReturnValue(projectNoDeps);
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(format).toBeCalledTimes(0);
    });
  });

  describe('walkedProjects tracking', () => {
    it('should not process the same project twice', async () => {
      const circularProject = {
        packageName: 'circular-package',
        projectFolder: '/path/to/circular',
        dependencyProjects: [
          {
            packageName: 'circular-package',
            projectFolder: '/path/to/circular',
            dependencyProjects: [],
          },
        ],
      };
      (getRushConfiguration as Mock).mockReturnValue({
        projects: [circularProject],
        rushJsonFolder: '/path/to/rush',
      });
      (lookupOnly as Mock).mockReturnValue(circularProject);
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });

      const repairer = new TsConfigRepairer({
        packageName: 'circular-package',
        submitChanges: false,
        recursivelyFix: true,
      });
      await repairer.run();

      expect(format).toBeCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle file read errors gracefully', async () => {
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockRejectedValue(new Error('File read error'));

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });

      await expect(repairer.run()).rejects.toThrow('File read error');
    });

    it('should handle prettier format errors', async () => {
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });
      (format as Mock).mockRejectedValue(new Error('Format error'));

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });

      await expect(repairer.run()).rejects.toThrow('Format error');
    });

    it('should handle writeFile errors', async () => {
      (isFileExists as Mock).mockImplementation(f =>
        Promise.resolve(f.endsWith('tsconfig.build.json') ? false : true),
      );
      (readJsonFile as Mock).mockResolvedValue({
        compilerOptions: {},
      });
      (writeFile as Mock).mockRejectedValue(new Error('Write error'));

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });

      await expect(repairer.run()).rejects.toThrow('Write error');
    });
  });

  describe('git operations', () => {
    it('should not call git add when submitChanges is false', async () => {
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        compilerOptions: { tsBuildInfoFile: '/foo/bar' },
      });
      (writeFile as Mock).mockResolvedValue(undefined);

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: false,
        recursivelyFix: false,
      });
      await repairer.run();

      expect(exec).not.toBeCalled();
    });

    it('should handle git command execution errors', async () => {
      (isFileExists as Mock).mockResolvedValue(true);
      (readJsonFile as Mock).mockResolvedValue({
        compilerOptions: {},
      });
      (writeFile as Mock).mockResolvedValue(undefined);
      (exec as Mock).mockImplementation(() => {
        throw new Error('Git command failed');
      });

      const repairer = new TsConfigRepairer({
        packageName: 'test-package',
        submitChanges: true,
        recursivelyFix: false,
      });

      await expect(repairer.run()).rejects.toThrow('Git command failed');
    });
  });
});
