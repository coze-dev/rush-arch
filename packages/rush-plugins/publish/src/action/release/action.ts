//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { logger } from '@coze-arch/logger';

import { getCurrentBranchName, getCurrentCommitHash } from '../../utils/git';
import { exec } from '../../utils/exec';
import { type PackageToPublish, type ReleaseOptions } from './types';
import { releasePackages } from './release';
import { checkReleasePlan } from './plan';
import { buildReleaseManifest } from './manifest';
import { getPackagesToPublish } from './git';

export async function release(options: ReleaseOptions): Promise<void> {
  const { dryRun = false, registry, packages } = options;
  let { commit } = options;
  const hasPassedCommit = !!options.commit;

  // 1. 获取需要发布的包列表
  let packagesToPublish: PackageToPublish[];
  if (packages) {
    // 直接使用传入的包列表
    packagesToPublish = packages;
    logger.info('Using provided package list');
  } else {
    // 从 git tags 获取包列表
    if (!hasPassedCommit) {
      commit = await getCurrentCommitHash();
      logger.info('Using current commit');
    }
    // 此时 commit 必定有值（要么传入了，要么刚获取了）
    const commitHash = commit as string;
    packagesToPublish = await getPackagesToPublish(commitHash);
  }

  if (packagesToPublish.length === 0) {
    logger.warn('No packages to publish');
    return;
  }

  // 2. 构建发布依赖树
  const releaseManifests = buildReleaseManifest(packagesToPublish);
  logger.info('Release manifests:');
  logger.info(
    releaseManifests
      .map(manifest => `${manifest.project.packageName}@${manifest.version}`)
      .join(', '),
    false,
  );
  const branchName = await getCurrentBranchName();
  checkReleasePlan(releaseManifests, branchName);

  // 只有在指定了 commit 且与当前 HEAD 不同时才切换
  if (hasPassedCommit) {
    const currentHead = await getCurrentCommitHash();
    if (currentHead !== commit) {
      logger.info(`Checking out commit: ${commit}`);
      await exec(`git checkout ${commit}`);
    }
  }

  await releasePackages(releaseManifests, { commit, dryRun, registry });
  logger.success('All packages published successfully!');
  logger.success(
    releaseManifests
      .map(manifest => `- ${manifest.project.packageName}@${manifest.version}`)
      .join('\n'),
    false,
  );
}
