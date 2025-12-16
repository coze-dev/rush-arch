//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { logger } from '@coze-arch/logger';

import { release } from '../release/action';
import { randomHash } from '../../utils/random';
import { ensureNotUncommittedChanges, isMainBranch } from '../../utils/git';
import { getRushConfiguration } from '../../utils/get-rush-config';
import { DEFAULT_NPM_REGISTRY } from '../../const';
import { generatePublishManifest } from './version';
import { BumpType, type PublishOptions } from './types';
import { pushToRemote } from './push-to-remote';
import { validateAndGetPackages } from './packages';
import { confirmForPublish } from './confirm';
import { generateChangelog } from './changelog';
import { applyPublishManifest } from './apply-new-version';

// 针对不同类型的发布，对应不同 sideEffects：
// 1. alpha: 直接创建并push 分支，触发 CI，执行发布；
// 2. beta: 本分支直接切换版本号，并发布
// 3. 正式版本：发起MR，MR 合入 main 后，触发发布

export const publish = async (options: PublishOptions) => {
  const sessionId = randomHash(6);
  const rushConfiguration = getRushConfiguration();
  const rushFolder = rushConfiguration.rushJsonFolder;
  if (
    process.env.SKIP_UNCOMMITTED_CHECK !== 'true' &&
    options.release !== true
  ) {
    await ensureNotUncommittedChanges();
  }

  // 1. 验证并获取需要发布的包列表
  const packagesToPublish = validateAndGetPackages(options);
  if (packagesToPublish.length === 0) {
    logger.error(
      'No packages to publish, should specify some package by `--to` or `--from` or `--only`',
    );
    return;
  }
  logger.debug(
    `Will publish the following packages:\n ${[...packagesToPublish].map(pkg => pkg.packageName).join('\n')}`,
  );

  // 2. 生成发布清单
  const { manifests: publishManifests, bumpPolicy } =
    await generatePublishManifest(packagesToPublish, {
      ...options,
      sessionId,
    });
  const isBetaPublish = [BumpType.BETA, BumpType.ALPHA].includes(
    bumpPolicy as BumpType,
  );
  if (
    process.env.SKIP_BRANCH_CHECK !== 'true' &&
    isBetaPublish === false &&
    (await isMainBranch()) === false
  ) {
    // 只允许在主分支发布
    logger.error(
      'You are not in main branch, please switch to main branch and try again.',
    );
    return;
  }

  const continuePublish = await confirmForPublish(
    publishManifests,
    !!options.dryRun,
    {
      isReleaseMode: !!options.release,
      registry: options.registry || DEFAULT_NPM_REGISTRY,
    },
  );

  if (!continuePublish) {
    return;
  }

  // 3. 应用更新，注意这里会修改文件，产生 sideEffect
  const postHandles = [applyPublishManifest];
  if (isBetaPublish === false) {
    postHandles.push(generateChangelog);
  }
  const changedFiles = (
    await Promise.all(postHandles.map(handle => handle(publishManifests)))
  ).flat();

  // 4. 创建并推送发布分支 或 直接发布
  let shouldRelease = false;
  console.log('debugger options', JSON.stringify(options), isBetaPublish);
  if (options.release) {
    // 验证 release 模式的前置条件
    if (isBetaPublish === false) {
      logger.error(
        'Direct release (--release) is only allowed for alpha or beta versions.',
      );
      logger.error(`Current bump type is: ${bumpPolicy}`);
      logger.warn('Falling back to normal publish mode...');
    } else {
      shouldRelease = true;
    }
  }

  if (shouldRelease) {
    // Release 模式：直接发布
    logger.info('Running in direct release mode...');
    logger.info('Starting package release...');
    const registry = options.registry || DEFAULT_NPM_REGISTRY;
    // 将 PublishManifest[] 转换为 PackageToPublish[]
    const packages = publishManifests.map(manifest => ({
      packageName: manifest.project.packageName,
      version: manifest.newVersion,
    }));
    await release({ dryRun: !!options.dryRun, registry, packages });
  } else {
    // 普通模式：创建并推送发布分支
    await pushToRemote({
      publishManifests,
      bumpPolicy: bumpPolicy as BumpType,
      sessionId,
      changedFiles,
      cwd: rushFolder,
      skipCommit: !!options.skipCommit,
      skipPush: !!options.skipPush,
      repoUrl: options.repoUrl,
      branchPrefix: options.branchPrefix,
    });
  }

  logger.success('Publish success.');
};
