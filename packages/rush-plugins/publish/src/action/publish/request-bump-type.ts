//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import chalk from 'chalk';
import { select } from '@inquirer/prompts';

import { BumpType } from './types';

/**
 * 获取更新类型的描述
 */
const getTypeDescription = (type: BumpType): string => {
  switch (type) {
    case BumpType.MAJOR:
      return `Major update, incompatible API changes, for example: ${chalk.green('1.1.1 -> 2.0.0')}`;
    case BumpType.MINOR:
      return `Minor update, backwards-compatible features, for example: ${chalk.green('1.1.1 -> 1.2.0')}`;
    case BumpType.PATCH:
      return `Patch update, backwards-compatible bug fixes, for example: ${chalk.green('1.1.1 -> 1.1.2')}`;
    case BumpType.BETA:
      return `Beta pre-release version, for example: ${chalk.green('1.1.1-beta.1')}`;
    case BumpType.ALPHA:
      return `Alpha pre-release version, for example: ${chalk.green('1.1.1-alpha.2597f3')}`;
    default:
      return '';
  }
};

/**
 * 让用户选择版本更新类型
 */
export const requestBumpType = async (): Promise<BumpType | null> => {
  const bumpTypesChoices = [
    BumpType.ALPHA,
    BumpType.BETA,
    BumpType.PATCH,
    BumpType.MINOR,
    BumpType.MAJOR,
  ];
  const choices = bumpTypesChoices.map(type => ({
    name: `${chalk.bold(type.toUpperCase())}: ${getTypeDescription(type)}`,
    value: type,
  }));

  try {
    const selected = await select({
      message: 'Select version bump type:',
      choices,
    });

    return selected;
  } catch (error) {
    return null;
  }
};
