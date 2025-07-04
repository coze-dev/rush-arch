//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';

import stylelint from 'stylelint';
import { logger } from '@coze-arch/logger';
import { isFileExists } from '@coze-arch/fs-enhance';

export const runLintInProject = async (params: {
  cwd: string;
  files: string[];
}): Promise<stylelint.LintResult[]> => {
  const { cwd, files } = params;
  const configFile = path.resolve(cwd, '.stylelintrc.js');
  if (!(await isFileExists(configFile))) {
    return [];
  }
  logger.info(`Start run stylelint at ${cwd}`);
  const lastConfig = await stylelint.resolveConfig(configFile);
  if (!lastConfig) {
    return [];
  }

  // 这个属性需要保留，否则没有检测到 需要 lint 文件的时候会报错
  lastConfig.allowEmptyInput = true;

  const { results } = await stylelint.lint({
    config: lastConfig,
    cwd,
    files,
    fix: false,
    quiet: true,
  });
  const errors = results.filter(r => r.warnings.length > 0);

  if (errors.length > 0) {
    const totalError = errors.reduce((acc, r) => acc + r.warnings.length, 0);
    logger.error(`Got ${totalError}'s errors at this run.`);
  }

  return errors;
};
