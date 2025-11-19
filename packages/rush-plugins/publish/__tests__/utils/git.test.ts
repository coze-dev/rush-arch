//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  getCurrentOrigin,
  getCurrentCommitHash,
  getCurrentBranchName,
} from '@/utils/git';
import { exec } from '@/utils/exec';

// Mock dependencies
vi.mock('@/utils/exec');

describe('git utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentOrigin', () => {
    it('should return the git origin url', async () => {
      const mockCwd = '/mock/cwd';
      const mockOriginUrl = 'git@github.com:test-owner/test-repo.git';

      vi.mocked(exec).mockResolvedValueOnce({
        stdout: `${mockOriginUrl}\n`,
        stderr: '',
        code: 0,
      });

      const result = await getCurrentOrigin(mockCwd);

      expect(exec).toHaveBeenCalledWith('git remote get-url origin', {
        cwd: mockCwd,
      });
      expect(result).toBe(mockOriginUrl);
    });

    it('should throw error when git command fails', async () => {
      const mockError = new Error('Git command failed');
      vi.mocked(exec).mockRejectedValueOnce(mockError);

      const result = await getCurrentOrigin();
      expect(result).toBeUndefined();
    });
  });

  describe('getCurrentCommitHash', () => {
    it('should return the current commit hash', async () => {
      const mockCommitHash = 'abc123def456';

      vi.mocked(exec).mockResolvedValueOnce({
        stdout: `${mockCommitHash}\n`,
        stderr: '',
        code: 0,
      });

      const result = await getCurrentCommitHash();

      expect(exec).toHaveBeenCalledWith('git rev-parse HEAD');
      expect(result).toBe(mockCommitHash);
    });

    it('should trim whitespace from commit hash', async () => {
      const mockCommitHash = 'abc123def456';

      vi.mocked(exec).mockResolvedValueOnce({
        stdout: `  ${mockCommitHash}  \n`,
        stderr: '',
        code: 0,
      });

      const result = await getCurrentCommitHash();

      expect(result).toBe(mockCommitHash);
    });

    it('should throw error when git command fails', async () => {
      const mockError = new Error('Git command failed');
      vi.mocked(exec).mockRejectedValueOnce(mockError);

      await expect(getCurrentCommitHash()).rejects.toThrow(
        'Git command failed',
      );
    });
  });

  describe('getCurrentBranchName', () => {
    it('should return the current branch name', async () => {
      const mockBranchName = 'main';

      vi.mocked(exec).mockResolvedValueOnce({
        stdout: `${mockBranchName}\n`,
        stderr: '',
        code: 0,
      });

      const result = await getCurrentBranchName();

      expect(exec).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD');
      expect(result).toBe(mockBranchName);
    });

    it('should trim whitespace from branch name', async () => {
      const mockBranchName = 'feature/test-branch';

      vi.mocked(exec).mockResolvedValueOnce({
        stdout: `  ${mockBranchName}  \n`,
        stderr: '',
        code: 0,
      });

      const result = await getCurrentBranchName();

      expect(result).toBe(mockBranchName);
    });
  });
});
