//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { confirm } from '@inquirer/prompts';
import { logger } from '@coze-arch/logger';

import { type PublishManifest } from '@/action/publish/types';
import { confirmForPublish } from '@/action/publish/confirm';

// Mock dependencies
vi.mock('@inquirer/prompts');
vi.mock('@coze-arch/logger');
vi.mock('chalk', () => ({
  default: {
    gray: vi.fn((str: string) => `gray(${str})`),
    bgGreen: vi.fn((str: string) => `bgGreen(${str})`),
    bold: vi.fn((str: string) => `bold(${str})`),
    yellow: Object.assign(
      vi.fn((str: string) => `yellow(${str})`),
      {
        bold: vi.fn((str: string) => `yellow.bold(${str})`),
      },
    ),
  },
}));

describe('confirm', () => {
  const mockPublishManifests: PublishManifest[] = [
    {
      project: {
        packageName: 'test-package-1',
      } as any,
      currentVersion: '1.0.0',
      newVersion: '1.1.0',
    },
    {
      project: {
        packageName: 'test-package-2',
      } as any,
      currentVersion: '2.0.0',
      newVersion: '2.1.0',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(confirm).mockResolvedValue(true);
  });

  describe('confirmForPublish', () => {
    it('should display package information correctly', async () => {
      await confirmForPublish(mockPublishManifests, false);

      expect(logger.info).toHaveBeenCalledWith(
        'gray(Will publish the following packages:)',
        false,
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          'test-package-1: bgGreen(1.0.0 -> bold(1.1.0))',
        ),
        false,
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          'test-package-2: bgGreen(2.0.0 -> bold(2.1.0))',
        ),
        false,
      );
    });

    it('should display empty line before confirmation prompt', async () => {
      await confirmForPublish(mockPublishManifests, false);
      expect(logger.info).toHaveBeenCalledWith('', false);
    });

    it('should return false when dry run is true', async () => {
      const result = await confirmForPublish(mockPublishManifests, true);
      expect(result).toBe(false);
      expect(confirm).not.toHaveBeenCalled();
    });

    it('should return true when user confirms', async () => {
      vi.mocked(confirm).mockResolvedValueOnce(true);
      const result = await confirmForPublish(mockPublishManifests, false);
      expect(result).toBe(true);
      expect(confirm).toHaveBeenCalledWith({
        message: 'Are you sure to publish?',
        default: true,
      });
    });

    it('should return false when user cancels', async () => {
      vi.mocked(confirm).mockResolvedValueOnce(false);
      const result = await confirmForPublish(mockPublishManifests, false);
      expect(result).toBe(false);
    });

    it('should return false when confirmation throws error', async () => {
      vi.mocked(confirm).mockRejectedValueOnce(new Error('User cancelled'));
      const result = await confirmForPublish(mockPublishManifests, false);
      expect(result).toBe(false);
    });

    it('should handle empty manifest list', async () => {
      await confirmForPublish([], false);
      expect(logger.info).toHaveBeenCalledWith(
        'gray(Will publish the following packages:)',
        false,
      );
    });

    it('should format version changes with correct styling', async () => {
      const singleManifest: PublishManifest[] = [
        {
          project: {
            packageName: 'test-package',
          } as any,
          currentVersion: '1.0.0',
          newVersion: '2.0.0',
        },
      ];

      await confirmForPublish(singleManifest, false);

      // 验证 chalk 样式的正确应用顺序
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          '- test-package: bgGreen(1.0.0 -> bold(2.0.0))',
        ),
        false,
      );
    });

    it('should handle scoped package names', async () => {
      const scopedManifest: PublishManifest[] = [
        {
          project: {
            packageName: '@scope/package',
          } as any,
          currentVersion: '1.0.0',
          newVersion: '1.1.0',
        },
      ];

      await confirmForPublish(scopedManifest, false);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          '- @scope/package: bgGreen(1.0.0 -> bold(1.1.0))',
        ),
        false,
      );
    });

    it('should display release mode warning when isReleaseMode is true', async () => {
      const registry = 'https://custom-registry.com';
      await confirmForPublish(mockPublishManifests, false, {
        isReleaseMode: true,
        registry,
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'yellow.bold(⚠️  Release Mode Enabled:)',
        false,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining(`bold(${registry})`),
        false,
      );
    });

    it('should use different confirmation message for release mode', async () => {
      await confirmForPublish(mockPublishManifests, false, {
        isReleaseMode: true,
        registry: 'https://registry.npmjs.org',
      });

      expect(confirm).toHaveBeenCalledWith({
        message: 'Are you sure to publish directly?',
        default: true,
      });
    });

    it('should use default confirmation message for normal mode', async () => {
      await confirmForPublish(mockPublishManifests, false);

      expect(confirm).toHaveBeenCalledWith({
        message: 'Are you sure to publish?',
        default: true,
      });
    });

    it('should show npm configured registry when registry is not provided in release mode', async () => {
      await confirmForPublish(mockPublishManifests, false, {
        isReleaseMode: true,
      });

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('npm configured registry'),
        false,
      );
    });

    it('should not display release warning in normal mode', async () => {
      await confirmForPublish(mockPublishManifests, false, {
        isReleaseMode: false,
      });

      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
