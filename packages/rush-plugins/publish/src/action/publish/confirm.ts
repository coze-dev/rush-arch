//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { logger } from '@coze-arch/logger';

import { type PublishManifest } from './types';

export interface ConfirmForPublishOptions {
  isReleaseMode?: boolean;
  registry?: string;
}

export const confirmForPublish = async (
  publishManifest: PublishManifest[],
  dryRun: boolean,
  options?: ConfirmForPublishOptions,
): Promise<boolean> => {
  logger.info(chalk.gray('Will publish the following packages:'), false);
  publishManifest.forEach(manifest => {
    const versionChange = `${manifest.currentVersion} -> ${chalk.bold(manifest.newVersion)}`;
    const msg = `${manifest.project.packageName}: ${chalk.bgGreen(versionChange)}`;
    logger.info(`- ${msg}`, false);
  });

  // Release 模式的额外提示
  if (options?.isReleaseMode) {
    logger.info('', false);
    logger.warn(chalk.yellow.bold('⚠️  Release Mode Enabled:'), false);
    const registryMsg = `   Packages will be published directly to: ${chalk.bold(options.registry || 'npm configured registry')}`;
    logger.warn(chalk.yellow(registryMsg), false);
  }

  if (dryRun) {
    return false;
  }

  logger.info('', false);
  try {
    const result = await confirm({
      message: options?.isReleaseMode
        ? 'Are you sure to publish directly?'
        : 'Are you sure to publish?',
      default: true,
    });
    return result;
  } catch (error) {
    return false;
  }
};
