//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

/**
 * CI 环境检测工具
 */
export const ciEnvironment = {
  /**
   * 检查是否在 GitHub Actions 环境中
   */
  isGitHubActions(): boolean {
    return process.env.GITHUB_ACTIONS === 'true';
  },

  /**
   * 检查是否在任何 CI 环境中
   */
  isCI(): boolean {
    return process.env.CI === 'true' || this.isGitHubActions();
  },

  /**
   * 获取 GitHub 仓库信息
   */
  getRepository(): string | undefined {
    return process.env.GITHUB_REPOSITORY;
  },

  /**
   * 获取当前工作流名称
   */
  getWorkflow(): string | undefined {
    return process.env.GITHUB_WORKFLOW;
  },

  /**
   * 获取运行 ID
   */
  getRunId(): string | undefined {
    return process.env.GITHUB_RUN_ID;
  },

  /**
   * 获取当前分支名
   */
  getBranch(): string | undefined {
    const ref = process.env.GITHUB_REF;
    if (!ref) {
      return undefined;
    }

    // 处理不同类型的 ref
    if (ref.startsWith('refs/heads/')) {
      return ref.replace('refs/heads/', '');
    }
    if (ref.startsWith('refs/tags/')) {
      return ref.replace('refs/tags/', '');
    }
    return ref;
  },

  /**
   * 检查是否是 Pull Request 事件
   */
  isPullRequest(): boolean {
    return process.env.GITHUB_EVENT_NAME === 'pull_request';
  },

  /**
   * 检查是否是 Push 事件
   */
  isPush(): boolean {
    return process.env.GITHUB_EVENT_NAME === 'push';
  },

  /**
   * 获取触发用户
   */
  getActor(): string | undefined {
    return process.env.GITHUB_ACTOR;
  },

  /**
   * 获取提交 SHA
   */
  getCommitSha(): string | undefined {
    return process.env.GITHUB_SHA;
  },

  /**
   * 获取运行器操作系统
   */
  getRunnerOS(): string | undefined {
    return process.env.RUNNER_OS;
  },

  /**
   * 获取完整的环境信息
   */
  getEnvironmentInfo() {
    if (!this.isGitHubActions()) {
      return {
        name: this.isCI() ? 'Unknown CI' : 'Local',
        isCI: this.isCI(),
        isGitHubActions: false,
      };
    }

    return {
      name: 'GitHub Actions',
      isCI: true,
      isGitHubActions: true,
      repository: this.getRepository(),
      workflow: this.getWorkflow(),
      runId: this.getRunId(),
      branch: this.getBranch(),
      actor: this.getActor(),
      commitSha: this.getCommitSha(),
      runnerOS: this.getRunnerOS(),
      eventName: process.env.GITHUB_EVENT_NAME,
      isPullRequest: this.isPullRequest(),
      isPush: this.isPush(),
    };
  },
};

/**
 * 简单的检查函数
 */
export const isGitHubActions = (): boolean => ciEnvironment.isGitHubActions();

export const isCI = (): boolean => ciEnvironment.isCI();
