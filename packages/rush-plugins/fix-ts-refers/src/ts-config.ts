// fix ts config references of each package
import path from 'path';
import { writeFile } from 'fs/promises';

import { exec } from 'shelljs';
import {
  type RushConfigurationProject,
  lookupOnly,
  lookupProjectsByFiles,
  getRushConfiguration,
} from '@coze-arch/monorepo-kits';
import { logger } from '@coze-arch/logger';
import { isFileExists, readJsonFile } from '@coze-arch/fs-enhance';

import { format } from './prettier';

interface Tsconfig {
  compilerOptions?: {
    outDir?: string;
    types?: string[];
    tsBuildInfoFile?: string;
  };
  references?: { path: string }[];
}

const DEFAULT_TS_OUTDIR = './lib-ts';

enum TsconfigJsonFile {
  BUILD = 'tsconfig.build.json',
  COMMON = 'tsconfig.json',
}

const lookupProjects = (packageName?: string): RushConfigurationProject[] => {
  if (typeof packageName === 'string' && packageName.length > 0) {
    return [lookupOnly(packageName)];
  }
  const config = getRushConfiguration();
  return config.projects;
};

interface RepairerContext {
  packageName?: string;
  changedFiles?: string[];
  submitChanges: boolean;
  recursivelyFix: boolean;
}
export class TsConfigRepairer {
  private context: RepairerContext;
  private walkedProjects: Set<string> = new Set();

  constructor(options: Partial<RepairerContext>) {
    this.context = Object.assign(
      { submitChanges: false, recursivelyFix: true },
      options,
    );
  }

  async run() {
    const { packageName, changedFiles } = this.context;
    const tasks: RushConfigurationProject[] = [];
    if (!packageName && !changedFiles) {
      tasks.push(...lookupProjects(undefined));
    } else {
      if (packageName) {
        tasks.push(...lookupProjects(packageName));
      }
      const changedPackageJsons = changedFiles?.filter(
        r => path.basename(r) === 'package.json',
      );
      if (changedPackageJsons && changedPackageJsons.length > 0) {
        tasks.push(...lookupProjectsByFiles(changedPackageJsons));
      }
    }

    logger.info(`Find ${tasks.length} packages to be fix tsconfig.`);
    for (const p of tasks) {
      await this.fix(p);
    }
    logger.success('process success');
  }

  private fix(projectConfig: RushConfigurationProject) {
    const { recursivelyFix } = this.context;
    const { walkedProjects } = this;
    const core = async (project: RushConfigurationProject) => {
      if (walkedProjects.has(project.packageName)) {
        return;
      }
      walkedProjects.add(project.packageName);
      if (
        (await isFileExists(
          path.resolve(project.projectFolder, TsconfigJsonFile.COMMON),
        )) === false
      ) {
        logger.info(
          `Skip ${project.packageName} because tsconfig file missing.`,
        );
        return;
      }
      const { dependencyProjects } = project;
      const subProjects = [...dependencyProjects];
      if (recursivelyFix === true) {
        // 先递归修复依赖模块的 reference 配置
        await Promise.all(subProjects.map(item => core(item)));
      }

      await this.ensureTsBuildConfig(project);
      await this.fixTsInfo(project);
      await this.fixTsReferences(project, subProjects);
    };
    return core(projectConfig);
  }

  private async writeTsConfigFile(file: string, config: Tsconfig | string) {
    const content = await format(
      typeof config === 'string' ? config : JSON.stringify(config, null, '  '),
      file,
    );
    await writeFile(file, content, 'utf-8');

    if (this.context.submitChanges === true) {
      exec(`git add ${file}`, {
        silent: true,
        async: true,
        cwd: getRushConfiguration().rushJsonFolder,
      });
    }
  }

  // 补齐缺失的 tsconfig.build.json 文件
  private async ensureTsBuildConfig(projectConfig: RushConfigurationProject) {
    const { projectFolder } = projectConfig;
    const tsBuildConfigFile = path.resolve(
      projectFolder,
      TsconfigJsonFile.BUILD,
    );
    if ((await isFileExists(tsBuildConfigFile)) === false) {
      const tsconfig = await readJsonFile<Tsconfig>(
        path.resolve(projectFolder, TsconfigJsonFile.COMMON),
      );

      const outDir =
        tsconfig.compilerOptions?.outDir ||
        // 为了避免与 package 已经定义的 dist/lib 等目录冲突，默认补齐的规则里使用 lib-ts 存储 ts 产物路径
        DEFAULT_TS_OUTDIR;
      const types = tsconfig.compilerOptions?.types || [];
      const template = {
        $schema: 'https://json.schemastore.org/tsconfig',
        extends: './tsconfig.json',
        compilerOptions: {
          types: types.filter(r => r !== 'vitest/globals'),
          rootDir: './src',
          outDir,
          tsBuildInfoFile: `${outDir}/tsconfig.build.tsbuildinfo`,
        },
        include: ['./src', './src/**/*.json'],
      };
      await this.writeTsConfigFile(tsBuildConfigFile, template);
    }
  }

  private async fixTsInfo(projectConfig: RushConfigurationProject) {
    const { projectFolder } = projectConfig;
    const tsBuildConfigFile = path.resolve(
      projectFolder,
      TsconfigJsonFile.BUILD,
    );
    const tsBuildConfig = await readJsonFile<Tsconfig>(tsBuildConfigFile);
    if (typeof tsBuildConfig.compilerOptions?.tsBuildInfoFile !== 'string') {
      let outDir = tsBuildConfig.compilerOptions?.outDir;
      if (typeof outDir !== 'string') {
        const tsConfig = await readJsonFile<Tsconfig>(
          path.resolve(projectFolder, TsconfigJsonFile.COMMON),
        );
        outDir = tsConfig.compilerOptions?.outDir || DEFAULT_TS_OUTDIR;
      }
      tsBuildConfig.compilerOptions = tsBuildConfig.compilerOptions || {};
      tsBuildConfig.compilerOptions.tsBuildInfoFile = `${outDir}/tsconfig.build.tsbuildinfo`;
      await this.writeTsConfigFile(tsBuildConfigFile, tsBuildConfig);
    }
  }

  private async fixTsReferences(
    projectConfig: RushConfigurationProject,
    subProjects: RushConfigurationProject[],
  ) {
    const { projectFolder } = projectConfig;
    const tsconfigFile = path.resolve(projectFolder, TsconfigJsonFile.BUILD);
    const relativePaths = await Promise.all(
      subProjects.map(r => {
        const depTsconfigFile = path.resolve(
          r.projectFolder,
          TsconfigJsonFile.BUILD,
        );
        const relativePath = path.relative(
          path.dirname(tsconfigFile),
          depTsconfigFile,
        );
        return relativePath;
      }),
    );
    const references = relativePaths
      .sort((r1, r2) =>
        r1.replaceAll('../', '').localeCompare(r2.replaceAll('../', '')),
      )
      .map(r => ({ path: r }));
    if (references.length > 0) {
      const tsconfig = await readJsonFile<Tsconfig>(tsconfigFile);
      await this.writeTsConfigFile(tsconfigFile, { ...tsconfig, references });
    }
  }
}
