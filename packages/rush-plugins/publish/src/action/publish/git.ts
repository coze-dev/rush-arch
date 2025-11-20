//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { logger } from '@coze-arch/logger';

import { exec } from '../../utils/exec';

export async function createAndPushBranch(
  branchName: string,
  cwd: string,
): Promise<void> {
  try {
    // 创建新分支
    await exec(`git checkout -b ${branchName}`, { cwd });
    logger.info(`Created new branch: ${branchName}`);

    // 推送到远程
    await exec(`git push -u origin ${branchName}`, { cwd });
    logger.info(`Pushed branch to remote: ${branchName}`);
  } catch (error) {
    throw new Error(`Failed to create/push branch: ${error}`);
  }
}

interface CommitChangesOptions {
  files: string[];
  cwd: string;
  branchName: string;
}
export async function commitChanges({
  files,
  cwd,
  branchName,
}: CommitChangesOptions): Promise<{ effects: string[]; branchName: string }> {
  await exec(`git add ${files.join(' ')}`, { cwd });
  await exec(`git commit -m "chore: Publish ${branchName}" -n`, { cwd });

  return { effects: [branchName], branchName };
}

export interface PushOptions {
  refs: string[];
  cwd: string;
  repoUrl: string;
}

export async function push({ refs, cwd, repoUrl }: PushOptions): Promise<void> {
  await exec(`git push ${repoUrl} ${refs.join(' ')} --no-verify`, {
    cwd,
  });
}
