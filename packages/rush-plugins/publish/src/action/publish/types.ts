//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type RushConfigurationProject } from '@rushstack/rush-sdk';

export enum BumpType {
  ALPHA = 'alpha',
  BETA = 'beta',
  PATCH = 'patch',
  MINOR = 'minor',
  MAJOR = 'major',
}

export interface PublishOptions {
  version?: string;
  dryRun?: boolean;
  to?: string[]; // 发布指定包及其下游依赖
  from?: string[]; // 发布指定包及其上下游依赖
  only?: string[]; // 仅发布指定包
  bumpType?: BumpType; // 版本升级类型
  skipCommit?: boolean; // 是否跳过提交
  skipPush?: boolean; // 是否跳过推送
  repoUrl: string; // Git 仓库 URL，例如：git@github.com:coze-dev/coze-js.git
  branchPrefix?: string; // Git 分支名前缀，默认见 DEFAULT_BRANCH_PREFIX
  release?: boolean; // 是否直接发布(仅支持 alpha/beta 版本)
  registry?: string; // NPM registry 地址，默认见 DEFAULT_NPM_REGISTRY
}

export interface PublishManifest {
  project: RushConfigurationProject;
  currentVersion: string;
  newVersion: string;
}

export type ApplyPublishManifest = (
  manifests: PublishManifest[],
) => Promise<string[]>;
