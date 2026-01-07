//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type RushConfigurationProject } from '@rushstack/rush-sdk';

export interface ReleaseOptions {
  commit?: string; // 可选，为空时使用当前 HEAD
  dryRun?: boolean;
  registry?: string; // 可选，优先级：CLI > package.json publishConfig > npm config
  packages?: PackageToPublish[]; // 可选，直接传入需要发布的包列表
  allowBranches?: string[]; // 可选，允许发布正式版本的分支列表
}

export interface PackageToPublish {
  packageName: string;
  version: string;
}

export interface ReleaseManifest {
  project: RushConfigurationProject;
  version: string;
}
