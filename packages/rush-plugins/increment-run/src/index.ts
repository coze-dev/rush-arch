import path from 'path';
import fs from 'fs';

import { Command } from 'commander';
import { readJsonFile } from '@coze-arch/fs-enhance';

import { extractChangedFilesByGitDiff } from './helper';
import { incrementAction } from './action';

const readPackageJson = () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'),
  );
  return packageJson;
};

export function createIncrementCommand(): Command {
  const program = new Command();
  const packageJson = readPackageJson();

  program
    .name('rush-increment-run')
    .version(packageJson.version)
    .description(packageJson.description)
    .showHelpAfterError(true)
    .showSuggestionAfterError(true)
    .command('increment')
    .option('-f, --changed-files <files>', '变更文件列表')
    .option('-p, --changed-path <path>', '变更文件列表所在文件路径')
    .option(
      '-b, --branch <branch>',
      '需要作对比的目标分支，使用该参数前建议先执行 `git fetch`，确保对比结果的正确性',
    )
    .option('-v, --verbose', '是否打印详细日志', false)
    .option('-a, --action <action>', '支持的增量操作命令', value => {
      const validActions = [
        'build',
        'coverage',
        'test:cov',
        'lint',
        'perf-defender',
        'ts-check',
        'style',
        'package-audit',
        'test',
      ];
      if (!validActions.includes(value)) {
        throw new Error(
          `Invalid action: ${value}. Valid actions are: ${validActions.join(', ')}`,
        );
      }
      return value;
    })
    .action(
      async (
        options: Partial<{
          branch: string;
          changedPath: string;
          changedFiles: string;
          action: string;
          verbose: boolean;
        }>,
      ) => {
        let changedFiles: string[];

        if (options.branch) {
          changedFiles = extractChangedFilesByGitDiff(options.branch);
        } else if (options.changedPath) {
          changedFiles = (await readJsonFile(options.changedPath)) as string[];
        } else if (options.changedFiles) {
          changedFiles = options.changedFiles.split(',');
        } else {
          throw new Error('Nothing changes.');
        }

        if (!options.action) {
          throw new Error('Action parameter is required.');
        }

        await incrementAction({
          changedFiles,
          action: options.action,
          verbose: options.verbose ?? false,
        });
      },
    );

  return program;
}

const main = () => {
  const program = createIncrementCommand();
  program.parse(process.argv);
};

main();
