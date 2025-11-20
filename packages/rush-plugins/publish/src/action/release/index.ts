//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type Command } from 'commander';
import { logger } from '@coze-arch/logger';

import { type InstallAction } from '../../types';
import { DEFAULT_NPM_REGISTRY, DEFAULT_ALLOW_BRANCHES } from '../../const';
import { type ReleaseOptions } from './types';
import { release } from './action';

export const installAction: InstallAction = (program: Command) => {
  program
    .command('release')
    .description('Release packages based on git tags.')
    .option('--commit <string>', '需要执行发布的 commit id (默认使用当前 HEAD)')
    .option('--dry-run', '是否只执行不真实发布', false)
    .option(
      '-r, --registry <string>',
      `发布到的 registry (默认: ${DEFAULT_NPM_REGISTRY})`,
      DEFAULT_NPM_REGISTRY,
    )
    .option(
      '--allow-branches <branches...>',
      `允许发布正式版本的分支列表 (默认: ${DEFAULT_ALLOW_BRANCHES.join(', ')})`,
    )
    .action(async (options: ReleaseOptions) => {
      try {
        if (!process.env.NPM_AUTH_TOKEN) {
          throw new Error('请设置 NPM_AUTH_TOKEN 环境变量');
        }
        await release(options);
      } catch (error) {
        logger.error('Release failed!');
        logger.error((error as Error).message);
        process.exit(1);
      }
    });
};
