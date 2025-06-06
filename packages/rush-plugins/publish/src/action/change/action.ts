//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';
import fs from 'fs/promises';

import { type RushConfiguration } from '@rushstack/rush-sdk';
import { logger } from '@coze-arch/logger';

import { getRushConfiguration } from '../../utils/get-rush-config';
import { type ChangeOptions } from './types';
import { generateAllChangesFile, analysisCommitMsg } from './helper';
import { amendCommit } from './amend-commit';

export const generateChangeFiles = async (options: ChangeOptions) => {
  // CI 环境的提交不做处理
  if (options.ci || process.env.CI === 'true') {
    return;
  }
  if (options.amendCommit) {
    amendCommit();
    return;
  }
  try {
    let { commitMsg } = options;
    if (!commitMsg) {
      const rushConfiguration: RushConfiguration = getRushConfiguration();
      commitMsg = await fs.readFile(
        path.resolve(rushConfiguration.rushJsonFolder, '.git/COMMIT_EDITMSG'),
        'utf-8',
      );
    }

    const { content, type } = await analysisCommitMsg(commitMsg);
    if (!content) {
      logger.warn('Invalid subject');
      return;
    }
    generateAllChangesFile(content, type);
  } catch (e) {
    logger.error(`Generate changes file fail \n ${e}`);
  }
};
