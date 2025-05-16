import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getCurrentOrigin } from '@/utils/git';
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
});
