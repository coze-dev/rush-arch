//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { checkRushProjectFile } from './rush-project';
import { checkPkgConfig } from './pkg-config';
import { checkEssentialConfigFiles } from './essential-configs';

export const presetRules = [
  checkRushProjectFile,
  checkEssentialConfigFiles,
  checkPkgConfig,
];
