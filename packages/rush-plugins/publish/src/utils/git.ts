//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { exec } from './exec';

const serializeFilesName = (output: string): string[] =>
  output
    .split('\n')
    .map(line => {
      if (line) {
        const trimmedLine = line.trim();
        return trimmedLine;
      }
      return '';
    })
    .filter(line => line && line.length > 0);

export const getChangedFilesFromCached = async (): Promise<string[]> => {
  const output = await exec('git diff --name-only --diff-filter=ACMR --cached');
  if (!output) {
    return [];
  }
  return serializeFilesName(output.stdout);
};

/**
 * 获取当前分支名称
 * @returns string
 */
export const getCurrentBranchName = async () => {
  const { stdout } = await exec('git rev-parse --abbrev-ref HEAD');
  return stdout.trim();
};

/**
 * 获取当前 commit hash
 * @returns commit hash
 */
export const getCurrentCommitHash = async (): Promise<string> => {
  const { stdout } = await exec('git rev-parse HEAD');
  return stdout.trim();
};

export const isMainBranch = async () => {
  const currentBranchName = await getCurrentBranchName();
  return currentBranchName === 'main';
};

export const getChangedFiles = async (): Promise<string[]> => {
  const output = await exec('git diff --name-only --diff-filter=ACMR');
  return serializeFilesName(output.stdout);
};

/**
 * 确保没有未提交的变更
 */
export const ensureNotUncommittedChanges = async () => {
  const changedFiles = (
    await Promise.all([getChangedFilesFromCached(), getChangedFiles()])
  ).flat();
  if (changedFiles.length > 0) {
    throw new Error(
      'There are uncommitted changes in the working tree, please commit them first.',
    );
  }
  return true;
};

/**
 * 获取当前 Git 仓库设置的 origin 远程源地址
 * @param cwd 当前工作目录
 * @returns origin 远程源地址
 */
export const getCurrentOrigin = async (
  cwd: string = process.cwd(),
): Promise<string | undefined> => {
  try {
    const { stdout } = await exec('git remote get-url origin', { cwd });
    return stdout.trim();
  } catch (error) {
    return undefined;
  }
};

export const convertGitSchemaToHttp = (gitUrl: string) =>
  gitUrl.replace('git@', 'https://').replace(':', '/').replace('.git', '');

/**
 * 解析 Git 远程仓库 URL，提取主机和仓库路径
 * 支持 HTTP/HTTPS 和 SSH 格式
 * @param gitUrl Git 仓库 URL
 * @returns 包含主机和仓库路径的对象，解析失败返回 null
 */
export const parseGitRemoteUrl = (
  gitUrl: string,
): { host: string; path: string; fullUrl: string } | null => {
  if (!gitUrl) {
    return null;
  }

  const trimmedUrl = gitUrl.trim().replace(/\.git$/, '');

  // 匹配 SSH 格式: git@github.com:owner/repo.git
  const sshMatch = trimmedUrl.match(/^git@([^:]+):(.+)$/);
  if (sshMatch) {
    const host = sshMatch[1];
    const path = sshMatch[2];
    return {
      host,
      path,
      fullUrl: `https://${host}/${path}`,
    };
  }

  // 匹配 HTTP/HTTPS 格式: https://github.com/owner/repo.git
  const httpMatch = trimmedUrl.match(/^https?:\/\/([^/]+)\/(.+)$/);
  if (httpMatch) {
    const host = httpMatch[1];
    const path = httpMatch[2];
    return {
      host,
      path,
      fullUrl: `https://${host}/${path}`,
    };
  }

  return null;
};

/**
 * 根据仓库信息构建 MR/PR 创建链接
 * @param repoInfo 仓库信息
 * @param branchName 分支名称
 * @returns MR/PR 创建链接，如果无法构建则返回 null
 */
export const buildMergeRequestUrl = (
  repoInfo: { host: string; path: string; fullUrl: string },
  branchName: string,
): string | null => {
  const { host, fullUrl } = repoInfo;

  // GitHub
  if (host.includes('github.com')) {
    return `${fullUrl}/compare/${branchName}?expand=1`;
  }

  // GitLab
  if (host.includes('gitlab')) {
    return `${fullUrl}/-/merge_requests/new?merge_request[source_branch]=${branchName}`;
  }

  // Gitee
  if (host.includes('gitee.com')) {
    return `${fullUrl}/compare/${branchName}...master`;
  }

  // Bitbucket
  if (host.includes('bitbucket')) {
    return `${fullUrl}/pull-requests/new?source=${branchName}`;
  }

  // 无法识别的平台
  return null;
};
