import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@coze-arch/logger';

import { exec } from '@/utils/exec';
import { type PublishManifest } from '@/action/publish/types';
import { createAndPushBranch, commitChanges, push } from '@/action/publish/git';

// Mock dependencies
vi.mock('@coze-arch/logger');
vi.mock('@/utils/exec');

describe('git operations', () => {
  const mockCwd = '/mock/cwd';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exec).mockResolvedValue({ stdout: '', stderr: '', code: 0 });
  });

  describe('createAndPushBranch', () => {
    it('should create and push a new branch', async () => {
      const branchName = 'feature/test-branch';

      await createAndPushBranch(branchName, mockCwd);

      expect(exec).toHaveBeenCalledTimes(2);
      expect(exec).toHaveBeenNthCalledWith(1, `git checkout -b ${branchName}`, {
        cwd: mockCwd,
      });
      expect(exec).toHaveBeenNthCalledWith(
        2,
        `git push -u origin ${branchName}`,
        {
          cwd: mockCwd,
        },
      );
      expect(logger.info).toHaveBeenCalledWith(
        `Created new branch: ${branchName}`,
      );
      expect(logger.info).toHaveBeenCalledWith(
        `Pushed branch to remote: ${branchName}`,
      );
    });

    it('should throw error when git command fails', async () => {
      const branchName = 'feature/test-branch';
      const mockError = new Error('Git command failed');
      vi.mocked(exec).mockRejectedValueOnce(mockError);

      await expect(createAndPushBranch(branchName, mockCwd)).rejects.toThrow(
        'Failed to create/push branch',
      );
    });
  });

  describe('commitChanges', () => {
    const mockPublishManifests: PublishManifest[] = [
      {
        project: {
          packageName: 'test-package',
        } as any,
        currentVersion: '1.0.0',
        newVersion: '1.1.0',
      },
    ];

    it('should commit changes and create tags', async () => {
      const options = {
        sessionId: 'test-session',
        files: ['package.json', 'CHANGELOG.md'],
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        branchName: 'release/test',
        createTags: true,
      };

      const result = await commitChanges(options);

      expect(exec).toHaveBeenCalledTimes(3);
      // 验证 git add
      expect(exec).toHaveBeenNthCalledWith(
        1,
        'git add package.json CHANGELOG.md',
        {
          cwd: mockCwd,
        },
      );
      // 验证 git commit
      expect(exec).toHaveBeenNthCalledWith(
        2,
        'git commit -m "chore: Publish release/test" -n',
        { cwd: mockCwd },
      );
      // 验证 git tag
      expect(exec).toHaveBeenNthCalledWith(
        3,
        'git tag -a v/test-package@1.1.0 -m "Bump type v/test-package@1.1.0"',
        { cwd: mockCwd },
      );

      expect(result).toEqual({
        effects: ['v/test-package@1.1.0', 'release/test'],
        branchName: 'release/test',
      });
    });

    it('should commit changes but do not create tags', async () => {
      const options = {
        sessionId: 'test-session',
        files: ['package.json', 'CHANGELOG.md'],
        cwd: mockCwd,
        publishManifests: mockPublishManifests,
        branchName: 'release/test',
        createTags: false,
      };

      const result = await commitChanges(options);

      expect(exec).toHaveBeenCalledTimes(2);
      // 验证 git add
      expect(exec).toHaveBeenNthCalledWith(
        1,
        'git add package.json CHANGELOG.md',
        {
          cwd: mockCwd,
        },
      );
      // 验证 git commit
      expect(exec).toHaveBeenNthCalledWith(
        2,
        'git commit -m "chore: Publish release/test" -n',
        { cwd: mockCwd },
      );

      expect(result).toEqual({
        effects: ['release/test'],
        branchName: 'release/test',
      });
    });
  });

  describe('push', () => {
    it('should push refs to remote', async () => {
      const refs = ['main', 'v1.0.0', 'feature/test'];
      await push({
        refs,
        cwd: mockCwd,
        repoUrl: 'git@github.com:coze-dev/coze-js.git',
      });

      expect(exec).toHaveBeenCalledWith(
        'git push git@github.com:coze-dev/coze-js.git main v1.0.0 feature/test --no-verify',
        { cwd: mockCwd },
      );
    });
  });
});
