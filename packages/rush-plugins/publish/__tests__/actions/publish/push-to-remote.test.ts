//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { logger } from '@coze-arch/logger';

import { getCurrentBranchName } from '@/utils/git';
import { exec } from '@/utils/exec';
import { BumpType } from '@/action/publish/types';
import { pushToRemote } from '@/action/publish/push-to-remote';
import { commitChanges, push } from '@/action/publish/git';

// Mock dependencies
vi.mock('dayjs');
vi.mock('@coze-arch/logger');
vi.mock('@/utils/git');
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

    it('should use existing branch for beta releases', async () => {
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
      expect(exec).not.toHaveBeenCalled(); // 不应该创建新分支
      expect(commitChanges).toHaveBeenCalledWith({
        sessionId: mockSessionId,
        files: mockChangedFiles,
        cwd: mockCwd,
        createTags: true,
        publishManifests: mockPublishManifests,
        branchName: mockBranchName,
      });
      expect(push).toHaveBeenCalledWith({
        refs: ['tag1', 'branch1'],
        cwd: mockCwd,
        repoUrl: REPO_URL,
      });
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
        sessionId: mockSessionId,
        files: mockChangedFiles,
        cwd: mockCwd,
        createTags: false,
        publishManifests: mockPublishManifests,
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

    it('should show GitHub Actions link for test releases', async () => {
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

      expect(logger.success).toHaveBeenCalledWith(
        'Please refer to https://github.com/test-owner/test-repo/actions/workflows/release.yml for the release progress.',
      );
    });

    it('should show PR link and open browser for production releases', async () => {
      const open = await import('open');
      const expectedBranchName = `release/${mockDate}-${mockSessionId}`;
      const expectedPrUrl = `https://github.com/test-owner/test-repo/compare/${expectedBranchName}?expand=1`;

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

      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining(expectedPrUrl),
        false,
      );
      expect(open.default).toHaveBeenCalledWith(expectedPrUrl);
    });
  });
});
