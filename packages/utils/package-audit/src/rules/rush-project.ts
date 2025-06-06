import path from 'path';

import { isFileExists, readJsonFile } from '@coze-arch/fs-enhance';

import { type AuditDetectResult, type AuditRule } from '../types';

const isEmptyCmd = (cmd?: string) =>
  typeof cmd !== 'string' || cmd.length <= 0 || /\s?exit\s?/.test(cmd);

export const checkRushProjectFile: AuditRule<unknown> = {
  name: 'rule-project.json',
  async fn(project, config?) {
    const { projectFolder, packageJson } = project;
    const rushProjectFilePath = path.resolve(
      projectFolder,
      'config/rush-project.json',
    );
    const res: AuditDetectResult[] = [];
    const commands = ['test:cov', 'build'];

    // always provide rush project config file
    if (!(await isFileExists(rushProjectFilePath))) {
      res.push({
        content: 'should provide "config/rush-project.json" file.',
      });
      return res;
    }

    // TODO: 这里要补充 readJsonFile 抛错的处理逻辑
    const projectConfig = await readJsonFile<{
      operationSettings: {
        operationName: string;
        outputFolderNames: string[];
      }[];
    }>(rushProjectFilePath);

    // validate cache config check
    commands.forEach(c => {
      if (isEmptyCmd(packageJson.scripts?.[c])) {
        // 如果命令为空，但是在rush-project.json中配置了
        if (projectConfig.operationSettings.find(r => r.operationName === c)) {
          res.push({
            content: `should NOT provide "${c}" cache config in config file. because command (${c}) is empty.`,
          });
        }
      } else {
        // 如果命令不为空，但是在rush-project.json中没有配置
        if (!projectConfig.operationSettings.find(r => r.operationName === c)) {
          res.push({
            content: `should provide "${c}" cache config in config file. because command (${c}) is not empty.`,
          });
        }
      }
    });

    // 检查 ts-check 配置
    if (
      projectConfig.operationSettings.findIndex(
        r => r.operationName === 'ts-check',
      ) < 0
    ) {
      res.push({
        content: 'should provide "ts-check" cache settings in config file.',
      });
    }

    return res;
  },
};
