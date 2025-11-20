//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { confirm } from '@inquirer/prompts';
import { logger } from '@coze-arch/logger';

import { getCurrentBranchName, getCurrentOrigin } from '@/utils/git';
import { exec } from '@/utils/exec';
import { BumpType } from '@/action/publish/types';
import { pushToRemote } from '@/action/publish/push-to-remote';
import { commitChanges, push } from '@/action/publish/git';

// Mock dependencies
vi.mock('dayjs');
vi.mock('@coze-arch/logger');
vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
}));
vi.mock('@/utils/git', async () => {
  const actual = await vi.importActual('@/utils/git');
  return {
    ...actual,
    getCurrentBranchName: vi.fn(),
    getCurrentOrigin: vi.fn(),
  };
});
vi.mock('@/utils/exec');
vi.mock('@/action/publish/git');
vi.mock('open', () => ({
  default: vi.fn(),
}));

const REPO_URL = 'git@github.com:test-owner/test-repo.git';

describe('push-to-remote', () => {
  const mockCwd = '/mock/cwd';
  const mockSessionId = 'test-session';
  const mockDate = '20240101';
  const mockBranchName = 'feature/test';
  const mockChangedFiles = ['package.json', 'CHANGELOG.md'];
  const mockPublishManifests = [
    {
      project: {
        packageName: 'test-package',
      },
      currentVersion: '1.0.0',
      newVersion: '1.1.0',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dayjs).mockReturnValue({ format: () => mockDate } as any);
    vi.mocked(getCurrentBranchName).mockResolvedValue(mockBranchName);
    vi.mocked(exec).mockResolvedValue({ stdout: '', stderr: '', code: 0 });
    vi.mocked(commitChanges).mockResolvedValue({
      effects: ['tag1', 'branch1'],
      branchName: mockBranchName,
    });
  });

  describe('pushToRemote', () => {
    it('should skip commit and push when skipCommit is true', async () => {
      await pushToRemote({
        sessionId: mockSessionId,
        changedFiles: mockChangedFiles,
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        bumpPolicy: BumpType.PATCH,
        skipCommit: true,
        skipPush: false,
      });

      expect(exec).not.toHaveBeenCalled();
      expect(commitChanges).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    });

    it('should use existing branch for beta releases and push when user confirms', async () => {
      vi.mocked(confirm).mockResolvedValue(true);

      await pushToRemote({
        sessionId: mockSessionId,
        changedFiles: mockChangedFiles,
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        bumpPolicy: BumpType.BETA,
        skipCommit: false,
        repoUrl: REPO_URL,
        skipPush: false,
      });

      expect(getCurrentBranchName).toHaveBeenCalled();
      expect(commitChanges).toHaveBeenCalledWith({
        files: mockChangedFiles,
        cwd: mockCwd,
        branchName: mockBranchName,
      });
      expect(push).toHaveBeenCalledWith({
        refs: ['tag1', 'branch1'],
        cwd: mockCwd,
        repoUrl: REPO_URL,
      });
      expect(logger.success).toHaveBeenCalledWith(
        `Changes have been committed to branch "${mockBranchName}".`,
      );
      expect(confirm).toHaveBeenCalledWith({
        message: 'Do you want to push the changes now?',
        default: true,
      });
      expect(exec).toHaveBeenCalledWith('git push', { cwd: mockCwd });
      expect(logger.success).toHaveBeenCalledWith(
        'Changes pushed successfully!',
      );
    });

    it('should use existing branch for beta releases and show manual message when user declines', async () => {
      vi.mocked(confirm).mockResolvedValue(false);

      await pushToRemote({
        sessionId: mockSessionId,
        changedFiles: mockChangedFiles,
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        bumpPolicy: BumpType.BETA,
        skipCommit: false,
        repoUrl: REPO_URL,
        skipPush: false,
      });

      expect(getCurrentBranchName).toHaveBeenCalled();
      expect(commitChanges).toHaveBeenCalledWith({
        files: mockChangedFiles,
        cwd: mockCwd,
        branchName: mockBranchName,
      });
      expect(push).toHaveBeenCalledWith({
        refs: ['tag1', 'branch1'],
        cwd: mockCwd,
        repoUrl: REPO_URL,
      });
      expect(logger.success).toHaveBeenCalledWith(
        `Changes have been committed to branch "${mockBranchName}".`,
      );
      expect(confirm).toHaveBeenCalledWith({
        message: 'Do you want to push the changes now?',
        default: true,
      });
      expect(exec).not.toHaveBeenCalledWith('git push', expect.anything());
      expect(logger.info).toHaveBeenCalledWith(
        'Please run "git push" manually when you are ready.',
      );
    });

    it('should create new branch for non-beta releases', async () => {
      await pushToRemote({
        sessionId: mockSessionId,
        changedFiles: mockChangedFiles,
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        bumpPolicy: BumpType.PATCH,
        skipCommit: false,
        repoUrl: REPO_URL,
        skipPush: false,
      });

      const expectedBranchName = `release/${mockDate}-${mockSessionId}`;
      expect(exec).toHaveBeenCalledWith(
        `git checkout -b ${expectedBranchName}`,
        {
          cwd: mockCwd,
        },
      );
      expect(commitChanges).toHaveBeenCalledWith({
        files: mockChangedFiles,
        cwd: mockCwd,
        branchName: expectedBranchName,
      });
      expect(push).toHaveBeenCalledWith({
        refs: ['tag1', 'branch1'],
        cwd: mockCwd,
        repoUrl: REPO_URL,
      });
    });

    it('should skip push when skipPush is true', async () => {
      await pushToRemote({
        sessionId: mockSessionId,
        changedFiles: mockChangedFiles,
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        bumpPolicy: BumpType.PATCH,
        skipCommit: false,
        skipPush: true,
      });

      expect(commitChanges).toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    });

    it('should not show any message for alpha releases', async () => {
      await pushToRemote({
        sessionId: mockSessionId,
        changedFiles: mockChangedFiles,
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        bumpPolicy: BumpType.ALPHA,
        skipCommit: false,
        skipPush: false,
        repoUrl: REPO_URL,
      });

      expect(push).toHaveBeenCalled();
      expect(logger.success).not.toHaveBeenCalled();
      expect(getCurrentOrigin).not.toHaveBeenCalled();
    });

    it('should show simple message when no origin is found for production releases', async () => {
      vi.mocked(getCurrentOrigin).mockResolvedValue(undefined);

      await pushToRemote({
        sessionId: mockSessionId,
        changedFiles: mockChangedFiles,
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        bumpPolicy: BumpType.PATCH,
        skipCommit: false,
        skipPush: false,
        repoUrl: REPO_URL,
      });

      const expectedBranchName = `release/${mockDate}-${mockSessionId}`;
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining(
          `Please create a merge request from branch "${expectedBranchName}" to the main branch in your repository.`,
        ),
      );
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining(
          'The release will be triggered after the merge request is merged.',
        ),
      );
    });

    it('should show PR link and open browser for GitHub repositories with release trigger message', async () => {
      const open = await import('open');
      const expectedBranchName = `release/${mockDate}-${mockSessionId}`;
      const expectedPrUrl = `https://github.com/test-owner/test-repo/compare/${expectedBranchName}?expand=1`;

      vi.mocked(getCurrentOrigin).mockResolvedValue(REPO_URL);

      await pushToRemote({
        sessionId: mockSessionId,
        changedFiles: mockChangedFiles,
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        bumpPolicy: BumpType.PATCH,
        skipCommit: false,
        skipPush: false,
        repoUrl: REPO_URL,
      });

      expect(getCurrentOrigin).toHaveBeenCalledWith(mockCwd);
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining(expectedPrUrl),
        false,
      );
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining(
          'The release will be triggered after the MR is merged.',
        ),
        false,
      );
      expect(open.default).toHaveBeenCalledWith(expectedPrUrl);
    });
  });
});
