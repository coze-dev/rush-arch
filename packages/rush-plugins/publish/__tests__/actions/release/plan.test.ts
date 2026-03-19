//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { type RushConfigurationProject } from '@rushstack/rush-sdk';

import { type ReleaseManifest } from '@/action/release/types';
import {
  checkReleasePlan,
  calReleaseType,
  ReleaseType,
} from '@/action/release/plan';

describe('plan', () => {
  const createMockProject = (name: string): RushConfigurationProject => {
    const project = {
      packageName: name,
      projectFolder: `/mock/project/${name}`,
      _shouldPublish: true,
      _versionPolicy: null,
      _dependencyProjects: new Set<RushConfigurationProject>(),
      _consumingProjects: new Set<RushConfigurationProject>(),
      _packageJson: {},
      projectRelativeFolder: `packages/${name}`,
      projectRushConfigFolder: '/mock/rush/config',
      projectRushTempFolder: '/mock/rush/temp',
      tempProjectName: name,
      unscopedTempProjectName: name,
      skipRushCheck: false,
      publishFolder: `/mock/project/${name}/dist`,
      isMainProject: false,
      dependencyProjects: new Set<RushConfigurationProject>(),
      consumingProjects: new Set<RushConfigurationProject>(),
      shouldPublish: true,
      versionPolicyName: undefined,
      decoupledLocalDependencies: [],
      rushConfiguration: {} as any,
      reviewCategory: undefined,
      packageJsonEditor: {} as any,
      isPublished: true,
      statusValue: 0,
      statusMessage: '',
      cyclicDependencyProjects: new Set<RushConfigurationProject>(),
      localDependencyProjects: new Set<RushConfigurationProject>(),
      tags: [],
    } as unknown as RushConfigurationProject;
    return project;
  };

  describe('calReleaseType', () => {
    it('should identify alpha versions', () => {
      expect(calReleaseType('1.0.0-alpha.1')).toBe(ReleaseType.ALPHA);
      expect(calReleaseType('2.0.0-alpha.0')).toBe(ReleaseType.ALPHA);
      expect(calReleaseType('0.1.0-alpha.5')).toBe(ReleaseType.ALPHA);
    });

    it('should identify beta versions', () => {
      expect(calReleaseType('1.0.0-beta.1')).toBe(ReleaseType.BETA);
      expect(calReleaseType('2.0.0-beta.0')).toBe(ReleaseType.BETA);
      expect(calReleaseType('0.1.0-beta.5')).toBe(ReleaseType.BETA);
    });

    it('should identify latest versions', () => {
      expect(calReleaseType('1.0.0')).toBe(ReleaseType.LATEST);
      expect(calReleaseType('2.0.0')).toBe(ReleaseType.LATEST);
      expect(calReleaseType('0.1.0')).toBe(ReleaseType.LATEST);
    });
  });

  describe('checkReleasePlan', () => {
    const mockProject1 = createMockProject('package-1');
    const mockProject2 = createMockProject('package-2');

    it('should allow alpha releases on any branch', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0-alpha.1',
        },
        {
          project: mockProject2,
          version: '2.0.0-alpha.1',
        },
      ];

      expect(() =>
        checkReleasePlan(releaseManifests, 'feature/test'),
      ).not.toThrow();
      expect(() => checkReleasePlan(releaseManifests, 'main')).not.toThrow();
      expect(() => checkReleasePlan(releaseManifests, 'develop')).not.toThrow();
    });

    it('should allow beta releases on any branch', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0-beta.1',
        },
        {
          project: mockProject2,
          version: '2.0.0-beta.1',
        },
      ];

      expect(() =>
        checkReleasePlan(releaseManifests, 'feature/test'),
      ).not.toThrow();
      expect(() => checkReleasePlan(releaseManifests, 'main')).not.toThrow();
      expect(() => checkReleasePlan(releaseManifests, 'develop')).not.toThrow();
    });

    it('should only allow latest releases on main branch (default)', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0',
        },
        {
          project: mockProject2,
          version: '2.0.0',
        },
      ];

      expect(() => checkReleasePlan(releaseManifests, 'main')).not.toThrow();
      expect(() =>
        checkReleasePlan(releaseManifests, 'feat/auto-publish'),
      ).not.toThrow();
      expect(() => checkReleasePlan(releaseManifests, 'feature/test')).toThrow(
        'For LATEST release, should be on one of these branches: main, feat/auto-publish.',
      );
      expect(() => checkReleasePlan(releaseManifests, 'develop')).toThrow(
        'For LATEST release, should be on one of these branches: main, feat/auto-publish.',
      );
    });

    it('should treat mixed versions as latest release', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0', // latest
        },
        {
          project: mockProject2,
          version: '2.0.0-beta.1', // beta
        },
      ];

      expect(() => checkReleasePlan(releaseManifests, 'main')).not.toThrow();
      expect(() => checkReleasePlan(releaseManifests, 'feature/test')).toThrow(
        'For LATEST release, should be on one of these branches: main, feat/auto-publish.',
      );
    });

    it('should treat mixed alpha/beta versions as beta release', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0-alpha.1', // alpha
        },
        {
          project: mockProject2,
          version: '2.0.0-beta.1', // beta
        },
      ];

      expect(() =>
        checkReleasePlan(releaseManifests, 'feature/test'),
      ).not.toThrow();
      expect(() => checkReleasePlan(releaseManifests, 'main')).not.toThrow();
      expect(() => checkReleasePlan(releaseManifests, 'develop')).not.toThrow();
    });

    it('should handle empty release manifests', () => {
      expect(() => checkReleasePlan([], 'main')).not.toThrow();
      expect(() => checkReleasePlan([], 'feature/test')).not.toThrow();
    });

    it('should handle single package release', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0',
        },
      ];

      expect(() => checkReleasePlan(releaseManifests, 'main')).not.toThrow();
      expect(() => checkReleasePlan(releaseManifests, 'feature/test')).toThrow(
        'For LATEST release, should be on one of these branches: main, feat/auto-publish.',
      );
    });

    it('should respect custom allowBranches parameter', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0',
        },
      ];

      const customBranches = ['production', 'release'];

      expect(() =>
        checkReleasePlan(releaseManifests, 'production', customBranches),
      ).not.toThrow();
      expect(() =>
        checkReleasePlan(releaseManifests, 'release', customBranches),
      ).not.toThrow();
      expect(() =>
        checkReleasePlan(releaseManifests, 'main', customBranches),
      ).toThrow(
        'For LATEST release, should be on one of these branches: production, release.',
      );
      expect(() =>
        checkReleasePlan(releaseManifests, 'feature/test', customBranches),
      ).toThrow(
        'For LATEST release, should be on one of these branches: production, release.',
      );
    });

    it('should allow empty allowBranches array (no restrictions)', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0',
        },
      ];

      expect(() =>
        checkReleasePlan(releaseManifests, 'any-branch', []),
      ).toThrow('For LATEST release, should be on one of these branches: .');
    });

    describe('glob pattern matching', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0',
        },
      ];

      it('should match branches with wildcard pattern', () => {
        const allowBranches = [
          'chore/*',
          'release/*',
          'integration/*',
          'master',
        ];

        // Should match
        expect(() =>
          checkReleasePlan(
            releaseManifests,
            'chore/upgrade-version',
            allowBranches,
          ),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'chore/fix-bug', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'release/v1.0.0', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'integration/test', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'master', allowBranches),
        ).not.toThrow();

        // Should not match
        expect(() =>
          checkReleasePlan(releaseManifests, 'feature/new', allowBranches),
        ).toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'main', allowBranches),
        ).toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'chore', allowBranches),
        ).toThrow();
      });

      it('should match branches with double-star pattern', () => {
        const allowBranches = ['release/**'];

        // Should match
        expect(() =>
          checkReleasePlan(releaseManifests, 'release/v1.0.0', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(
            releaseManifests,
            'release/2024/v1.0.0',
            allowBranches,
          ),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(
            releaseManifests,
            'release/prod/v1.0.0',
            allowBranches,
          ),
        ).not.toThrow();

        // Should not match
        expect(() =>
          checkReleasePlan(releaseManifests, 'chore/fix', allowBranches),
        ).toThrow();
      });

      it('should match branches with prefix pattern', () => {
        const allowBranches = ['feat-*', 'hotfix-*'];

        // Should match
        expect(() =>
          checkReleasePlan(releaseManifests, 'feat-123', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'hotfix-urgent', allowBranches),
        ).not.toThrow();

        // Should not match
        expect(() =>
          checkReleasePlan(releaseManifests, 'feat/123', allowBranches),
        ).toThrow();
      });

      it('should match branches with suffix pattern', () => {
        const allowBranches = ['*-prod', '*-staging'];

        // Should match
        expect(() =>
          checkReleasePlan(releaseManifests, 'release-prod', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'deploy-staging', allowBranches),
        ).not.toThrow();

        // Should not match
        expect(() =>
          checkReleasePlan(releaseManifests, 'release-dev', allowBranches),
        ).toThrow();
      });
    });

    describe('regex pattern matching', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0',
        },
      ];

      it('should match branches with regex pattern', () => {
        const allowBranches = ['/^(main|master|develop)$/'];

        // Should match
        expect(() =>
          checkReleasePlan(releaseManifests, 'main', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'master', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'develop', allowBranches),
        ).not.toThrow();

        // Should not match
        expect(() =>
          checkReleasePlan(releaseManifests, 'main-backup', allowBranches),
        ).toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'feature/test', allowBranches),
        ).toThrow();
      });

      it('should match branches with version number regex', () => {
        const allowBranches = ['/^release\\/v\\d+\\.\\d+\\.\\d+$/'];

        // Should match
        expect(() =>
          checkReleasePlan(releaseManifests, 'release/v1.0.0', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'release/v2.10.5', allowBranches),
        ).not.toThrow();

        // Should not match
        expect(() =>
          checkReleasePlan(releaseManifests, 'release/v1', allowBranches),
        ).toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'release/v1.0', allowBranches),
        ).toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'chore/v1.0.0', allowBranches),
        ).toThrow();
      });

      it('should handle invalid regex gracefully', () => {
        const allowBranches = ['/^(invalid/'];

        // Should fall back to exact match
        expect(() =>
          checkReleasePlan(releaseManifests, '/^(invalid/', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'main', allowBranches),
        ).toThrow();
      });
    });

    describe('mixed pattern matching', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0',
        },
      ];

      it('should support mix of exact, glob, and regex patterns', () => {
        const allowBranches = [
          'main', // exact match
          'chore/*', // glob pattern
          '/^release\\/v\\d+\\.\\d+\\.\\d+$/', // regex pattern
        ];

        // Should match exact
        expect(() =>
          checkReleasePlan(releaseManifests, 'main', allowBranches),
        ).not.toThrow();

        // Should match glob
        expect(() =>
          checkReleasePlan(releaseManifests, 'chore/fix-bug', allowBranches),
        ).not.toThrow();

        // Should match regex
        expect(() =>
          checkReleasePlan(releaseManifests, 'release/v1.0.0', allowBranches),
        ).not.toThrow();

        // Should not match
        expect(() =>
          checkReleasePlan(releaseManifests, 'feature/test', allowBranches),
        ).toThrow();
      });
    });

    describe('edge cases', () => {
      const releaseManifests: ReleaseManifest[] = [
        {
          project: mockProject1,
          version: '1.0.0',
        },
      ];

      it('should handle branches with special characters', () => {
        const allowBranches = ['feat/*'];

        expect(() =>
          checkReleasePlan(
            releaseManifests,
            'feat/user-profile',
            allowBranches,
          ),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'feat/issue-#123', allowBranches),
        ).not.toThrow();
      });

      it('should handle branches with multiple slashes', () => {
        const allowBranches = ['team/**'];

        expect(() =>
          checkReleasePlan(
            releaseManifests,
            'team/frontend/feature',
            allowBranches,
          ),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(
            releaseManifests,
            'team/backend/fix/urgent',
            allowBranches,
          ),
        ).not.toThrow();
      });

      it('should be case-sensitive by default', () => {
        const allowBranches = ['Main', 'CHORE/*'];

        expect(() =>
          checkReleasePlan(releaseManifests, 'Main', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'main', allowBranches),
        ).toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'CHORE/fix', allowBranches),
        ).not.toThrow();
        expect(() =>
          checkReleasePlan(releaseManifests, 'chore/fix', allowBranches),
        ).toThrow();
      });
    });
  });
});
