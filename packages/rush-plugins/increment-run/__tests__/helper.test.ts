import { type Mock } from 'vitest';
import { exec } from 'shelljs';
import { logger as log } from '@coze-arch/logger';

import { isCI } from '../src/utils/env';
import { extractChangedFilesByGitDiff, stopProcess } from '../src/helper';

// Mocking the log and shell objects
vi.mock('@coze-arch/logger', () => ({
  logger: { debug: vi.fn(), success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

vi.mock('shelljs', () => ({ exec: vi.fn() }));

vi.mock('../src/utils/env', () => ({
  isCI: vi.fn(),
}));

// Testing extractChangedFilesByGitDiff function
describe('helper', () => {
  describe('extractChangedFilesByGitDiff', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should log the command and return the changed files', () => {
      const branch = 'test-branch';
      (exec as Mock).mockReturnValue({
        code: 0,
        toString() {
          return ['file1.js', 'file2.js', 'file3.js'].join('\n');
        },
      });

      const result = extractChangedFilesByGitDiff(branch);

      expect(exec).toHaveBeenCalledWith(
        'git diff --name-only upstream/test-branch...',
      );
      expect(result).toEqual(['file1.js', 'file2.js', 'file3.js']);
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should log the command and throw an error when the command fails', () => {
      const branch = 'invalid-branch';
      (exec as Mock).mockReturnValue({
        code: 1,
        stderr: {
          toString() {
            return 'Command failed';
          },
        },
      });

      const res = extractChangedFilesByGitDiff(branch);
      expect(res).toBeUndefined();
      expect(log.error).toHaveBeenCalledWith(
        expect.stringMatching('Command failed'),
      );

      expect(exec).toHaveBeenCalledWith(
        'git diff --name-only upstream/invalid-branch...',
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('stopProcess', () => {
    it('should set exit code and exit immediately if not in CI environment', () => {
      // Mock isCI to return false
      (isCI as Mock).mockReturnValue(false);

      const code = 1;

      // Mock process.exitCode and process.exit
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation();

      stopProcess(code);

      expect(exitSpy).toHaveBeenCalledWith(code);
      expect(process.exitCode).toBe(code);

      exitSpy.mockRestore();
    });

    it('should set exit code and exit after a delay if in CI environment', () => {
      // Mock isCI to return true
      (isCI as Mock).mockReturnValue(true);

      const code = 2;
      const delay = 1000;

      // Mock process.exitCode and process.exit
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        // do nothing
      });

      vi.useFakeTimers();

      stopProcess(code);

      expect(exitSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(delay);

      expect(exitSpy).toHaveBeenCalledWith(code);
      expect(process.exitCode).toBe(code);

      exitSpy.mockRestore();
    });
  });
});
