//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getRushConfiguration } from '@/utils/get-rush-config';
import { type PackageToPublish } from '@/action/release/types';
import { buildReleaseManifest } from '@/action/release/manifest';

// Mock dependencies
vi.mock('@/utils/get-rush-config');

describe('manifest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildReleaseManifest', () => {
    it('should build release manifest for valid packages', () => {
      const mockPackages: PackageToPublish[] = [
        { packageName: 'package-a', version: '1.0.0' },
        { packageName: 'package-b', version: '2.0.0' },
      ];

      const mockProjects = {
        'package-a': {
          packageName: 'package-a',
          packageJson: { version: '1.0.0' },
          shouldPublish: true,
        },
        'package-b': {
          packageName: 'package-b',
          packageJson: { version: '2.0.0' },
          shouldPublish: true,
        },
      };

      vi.mocked(getRushConfiguration).mockReturnValue({
        getProjectByName: vi.fn(
          (name: string) => mockProjects[name as keyof typeof mockProjects],
        ),
      } as any);

      const result = buildReleaseManifest(mockPackages);

      expect(result).toEqual([
        {
          project: mockProjects['package-a'],
          version: '1.0.0',
        },
        {
          project: mockProjects['package-b'],
          version: '2.0.0',
        },
      ]);
    });

    it('should throw error for non-existent package', () => {
      const mockPackages: PackageToPublish[] = [
        { packageName: 'non-existent-package', version: '1.0.0' },
      ];

      vi.mocked(getRushConfiguration).mockReturnValue({
        getProjectByName: vi.fn(() => null),
      } as any);

      expect(() => buildReleaseManifest(mockPackages)).toThrow(
        'Cannot find project: non-existent-package',
      );
    });

    it('should handle empty package list', () => {
      const result = buildReleaseManifest([]);
      expect(result).toEqual([]);
    });

    it('should handle scoped packages', () => {
      const mockPackages: PackageToPublish[] = [
        { packageName: '@scope/package-a', version: '1.0.0' },
      ];

      const mockProjects = {
        '@scope/package-a': {
          packageName: '@scope/package-a',
          packageJson: { version: '1.0.0' },
          shouldPublish: true,
        },
      } as const;

      vi.mocked(getRushConfiguration).mockReturnValue({
        getProjectByName: vi.fn(
          (name: string) => mockProjects[name as keyof typeof mockProjects],
        ),
      } as any);

      const result = buildReleaseManifest(mockPackages);

      expect(result).toEqual([
        {
          project: mockProjects['@scope/package-a'],
          version: '1.0.0',
        },
      ]);
    });
  });
});
