import dayjs from 'dayjs';
import { logger } from '@coze-arch/logger';

import { getCurrentBranchName } from '../../utils/git';
import { exec } from '../../utils/exec';
import { type PublishManifest, BumpType } from './types';
import { commitChanges, push } from './git';
import { GIT_REPO_URL_REGEX } from './const';

interface PushToRemoteOptions {
  sessionId: string;
  changedFiles: string[];
  cwd: string;
  publishManifests: PublishManifest[];
  bumpPolicy: BumpType | string;
  skipCommit: boolean;
  skipPush: boolean;
  repoUrl: string;
}

export const pushToRemote = async (options: PushToRemoteOptions) => {
  const {
    sessionId,
    changedFiles,
    cwd,
    publishManifests,
    bumpPolicy,
    skipCommit,
    skipPush,
    repoUrl,
  } = options;
  if (skipCommit) {
    return;
  }

  // 获取仓库 URL
  const actualRepoUrl = repoUrl;

  let branchName: string;
  if (bumpPolicy === BumpType.BETA) {
    branchName = await getCurrentBranchName();
  } else {
    const date = dayjs().format('YYYYMMDD');
    branchName = `release/${date}-${sessionId}`;
    await exec(`git checkout -b ${branchName}`, { cwd });
  }
  const isTestPublish = [BumpType.ALPHA, BumpType.BETA].includes(
    bumpPolicy as BumpType,
  );

  // 4. 创建并推送发布分支
  const { effects } = await commitChanges({
    sessionId,
    files: changedFiles,
    cwd,
    publishManifests,
    branchName,
    // 只有 alpha、beta 需要创建 tag，正式发布会在 .github/workflows/common-pr-checks.yml 创建并发布tag
    createTags: isTestPublish,
  });
  if (skipPush) {
    return;
  }
  await push({
    refs: effects,
    cwd,
    repoUrl: actualRepoUrl,
  });

  // 从 git URL 提取组织和仓库名称，用于构建 GitHub 链接
  const repoInfoMatch = actualRepoUrl.match(GIT_REPO_URL_REGEX);
  if (!repoInfoMatch) {
    throw new Error('Invalid git repository URL');
  }
  const repoOwner = repoInfoMatch[1];
  const repoName = repoInfoMatch[2];

  if (isTestPublish) {
    logger.success(
      `Please refer to https://github.com/${repoOwner}/${repoName}/actions/workflows/release.yml for the release progress.`,
    );
  } else {
    const prUrl = `https://github.com/${repoOwner}/${repoName}/compare/${branchName}?expand=1`;
    const log = [
      '************************************************',
      '*',
      `* Please create PR: ${prUrl}`,
      '*',
      '************************************************',
    ];
    logger.success(log.join('\n'), false);
    const open = await import('open');
    await open.default(prUrl);
  }
};
