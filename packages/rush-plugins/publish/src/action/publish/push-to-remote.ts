//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import dayjs from 'dayjs';
import { confirm } from '@inquirer/prompts';
import { logger } from '@coze-arch/logger';

import {
  getCurrentBranchName,
  getCurrentOrigin,
  parseGitRemoteUrl,
  buildMergeRequestUrl,
} from '../../utils/git';
import { exec } from '../../utils/exec';
import { type PublishManifest, BumpType } from './types';
import { commitChanges, push } from './git';

interface PushToRemoteOptions {
  sessionId: string;
  changedFiles: string[];
  cwd: string;
  publishManifests: PublishManifest[];
  bumpPolicy: BumpType | string;
  skipCommit: boolean;
  skipPush: boolean;
  repoUrl: string;
  branchPrefix?: string;
}

/**
 * 获取或创建发布分支
 */
const getOrCreateBranch = async (params: {
  bumpPolicy: BumpType | string;
  sessionId: string;
  branchPrefix: string;
  cwd: string;
}): Promise<string> => {
  const { bumpPolicy, sessionId, branchPrefix, cwd } = params;

  if (bumpPolicy === BumpType.BETA) {
    return await getCurrentBranchName();
  }

  const date = dayjs().format('YYYYMMDD');
  const branchName = `${branchPrefix}/${date}-${sessionId}`;
  await exec(`git checkout -b ${branchName}`, { cwd });
  return branchName;
};

/**
 * 处理 Beta 发布流程：询问并执行 git push
 */
const handleBetaPublish = async (
  branchName: string,
  cwd: string,
): Promise<void> => {
  logger.success(`Changes have been committed to branch "${branchName}".`);

  const shouldPush = await confirm({
    message: 'Do you want to push the changes now?',
    default: true,
  });

  if (shouldPush) {
    logger.info('Pushing changes to remote...');
    await exec('git push', { cwd });
    logger.success('Changes pushed successfully!');
  } else {
    logger.info('Please run "git push" manually when you are ready.');
  }
};

/**
 * 显示手动创建 MR 的提示消息
 */
const showManualMrMessage = (
  branchName: string,
  repositoryUrl?: string,
): void => {
  const baseMessage = `Please create a merge request from branch "${branchName}" to the main branch`;
  const suffix =
    'The release will be triggered after the merge request is merged.';

  if (repositoryUrl) {
    logger.success(
      `Repository: ${repositoryUrl}\n${baseMessage}.\n${suffix}`,
      false,
    );
  } else {
    logger.success(`${baseMessage} in your repository.\n${suffix}`);
  }
};

/**
 * 显示 MR/PR 创建链接并打开浏览器
 */
const showMrLinkAndOpenBrowser = async (mrUrl: string): Promise<void> => {
  const log = [
    '************************************************',
    '*',
    `* Please create MR/PR: ${mrUrl}`,
    '*',
    '* The release will be triggered after the MR is merged.',
    '*',
    '************************************************',
  ];
  logger.success(log.join('\n'), false);

  const open = await import('open');
  await open.default(mrUrl);
};

/**
 * 处理正式版本发布流程：提示创建 MR/PR
 */
const handleProductionPublish = async (
  branchName: string,
  cwd: string,
): Promise<void> => {
  const originUrl = await getCurrentOrigin(cwd);
  if (!originUrl) {
    showManualMrMessage(branchName);
    return;
  }

  const repoInfo = parseGitRemoteUrl(originUrl);
  if (!repoInfo) {
    showManualMrMessage(branchName);
    return;
  }

  const mrUrl = buildMergeRequestUrl(repoInfo, branchName);
  if (!mrUrl) {
    showManualMrMessage(branchName, repoInfo.fullUrl);
    return;
  }

  await showMrLinkAndOpenBrowser(mrUrl);
};

/**
 * 根据发布类型处理后续提示
 */
const handlePostPushPrompts = async (
  bumpPolicy: BumpType | string,
  branchName: string,
  cwd: string,
): Promise<void> => {
  const isAlphaPublish = bumpPolicy === BumpType.ALPHA;
  const isBetaPublish = bumpPolicy === BumpType.BETA;

  // Alpha 发布：不需要提示（会自动触发 CI 发布）
  if (isAlphaPublish) {
    return;
  }

  // Beta 发布：询问用户是否立即执行 git push
  if (isBetaPublish) {
    await handleBetaPublish(branchName, cwd);
    return;
  }

  // 正式版本发布：提示创建 MR/PR
  await handleProductionPublish(branchName, cwd);
};

export const pushToRemote = async (options: PushToRemoteOptions) => {
  const {
    sessionId,
    changedFiles,
    cwd,
    bumpPolicy,
    skipCommit,
    skipPush,
    repoUrl,
    branchPrefix = 'release',
  } = options;

  if (skipCommit) {
    return;
  }

  // 1. 获取或创建发布分支
  const branchName = await getOrCreateBranch({
    bumpPolicy,
    sessionId,
    branchPrefix,
    cwd,
  });

  // 2. 提交变更
  const { effects } = await commitChanges({
    files: changedFiles,
    cwd,
    branchName,
  });

  if (skipPush) {
    return;
  }

  // 3. 推送变更
  await push({
    refs: effects,
    cwd,
    repoUrl,
  });

  // 4. 根据发布类型显示不同提示
  await handlePostPushPrompts(bumpPolicy, branchName, cwd);
};
