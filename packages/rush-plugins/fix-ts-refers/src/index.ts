import path from 'path';

import { exec } from 'shelljs';
import { Command } from 'commander';
import { getRushConfiguration } from '@coze-arch/monorepo-kits';
import { readJsonFile } from '@coze-arch/fs-enhance';

import { TsConfigRepairer } from './ts-config';

// 获取 Git 缓存中的变更文件列表
const getChangedFilesFromCached = (): string[] => {
  const output = exec('git diff --name-only --diff-filter=ACMR --cached', {
    silent: true,
    cwd: getRushConfiguration().rushJsonFolder,
  });
  return output
    .split('\n')
    .map(line => {
      if (line) {
        const trimmedLine = line.trim();
        return trimmedLine;
      }
      return '';
    })
    .filter(line => line && line.length > 0);
};

const readPackageJson = () => {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  return readJsonFile<{ name: string; version: string; description: string }>(
    packageJsonPath,
  );
};

// 定义命令行选项接口
interface FixOptions {
  package?: string;
  useCachedFiles: boolean;
  submitChanges: boolean;
  shallow: boolean;
}

// TypeScript 修复处理函数
const executeFixCommand = async (options: FixOptions): Promise<void> => {
  const {
    package: packageName,
    useCachedFiles,
    submitChanges,
    shallow,
  } = options;
  const changedFiles = useCachedFiles ? getChangedFilesFromCached() : undefined;

  const repairer = new TsConfigRepairer({
    packageName,
    changedFiles,
    recursivelyFix: !shallow,
    submitChanges,
  });

  await repairer.run();
};

// 创建和配置命令
const main = async () => {
  const program = new Command();
  const packageJson = await readPackageJson();

  program
    .name(packageJson.name)
    .description(packageJson.description)
    .command('fix')
    .option(
      '-p, --package <package>',
      '需要执行操作的子项目名称，要求必须在 rush.json 中配置的项',
    )
    .option(
      '-c, --use-cached-files',
      '发生变更的文件列表，fix 命令会根据这份列表做自动格式化',
      false,
    )
    .option(
      '-s, --submit-changes',
      '是否自动提交变更，建议仅在 pre-commit hooks 使用',
      false,
    )
    .option('--shallow', '是否禁用递归处理逻辑，只对顶层包做修复', false)
    .action(async (options: FixOptions) => {
      await executeFixCommand(options);
    });

  program.parse(process.argv);
};

main();
