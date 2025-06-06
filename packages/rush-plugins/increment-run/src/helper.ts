import { exec } from 'shelljs';
import { logger } from '@coze-arch/logger';

import { isCI } from './utils/env';

export const stopProcess = (code: number): void => {
  const ONE_SEC = 1000;
  if (isCI()) {
    setTimeout(() => {
      process.exitCode = code;
      process.exit(code);
      // 预留 1s，给 CI 清理
    }, ONE_SEC);
  } else {
    process.exitCode = code;
    process.exit(code);
  }
};

const execGitDiffFiles = (branch: string): string[] => {
  // const targetBranch = /^origin\//.test(branch) ? branch : `origin/${branch}`;
  const targetBranch = branch;
  const command = `git diff --name-only ${targetBranch}...`;
  logger.info(command);
  const res = exec(command);
  if (res.code === 0) {
    return res.toString().split('\n');
  }
  throw new Error(`Run command failure with error:

${res.stderr.toString()}
  `);
};

export const extractChangedFilesByGitDiff = (branch: string): string[] => {
  logger.info('建议在执行改命令前，先执行 `git fetch`，以确保结果的及时性');
  try {
    return execGitDiffFiles(branch);
  } catch (e) {
    logger.error((e as Error).message);
    process.exit(1);
  }
};
