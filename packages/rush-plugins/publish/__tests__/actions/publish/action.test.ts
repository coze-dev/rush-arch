//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  type RushConfigurationProject,
  type VersionPolicy,
} from '@rushstack/rush-sdk';
import { logger } from '@coze-arch/logger';

import { randomHash } from '@/utils/random';
import { ensureNotUncommittedChanges, isMainBranch } from '@/utils/git';
import { getRushConfiguration } from '@/utils/get-rush-config';
import { release } from '@/action/release/action';
import { generatePublishManifest } from '@/action/publish/version';
import { BumpType, type PublishOptions } from '@/action/publish/types';
import { pushToRemote } from '@/action/publish/push-to-remote';
import { validateAndGetPackages } from '@/action/publish/packages';
import { confirmForPublish } from '@/action/publish/confirm';
import { generateChangelog } from '@/action/publish/changelog';
import { applyPublishManifest } from '@/action/publish/apply-new-version';
import { publish } from '@/action/publish/action';

// Mock dependencies
vi.mock('@coze-arch/logger');
vi.mock('@/utils/random');
vi.mock('@/utils/get-rush-config');
vi.mock('@/utils/git');
vi.mock('@/action/publish/version');
vi.mock('@/action/publish/packages');
vi.mock('@/action/publish/confirm');
vi.mock('@/action/publish/changelog');
vi.mock('@/action/publish/apply-new-version');
vi.mock('@/action/publish/push-to-remote');
vi.mock('@/action/release/action');

describe('publish action', () => {
  const mockRushFolder = '/mock/rush';
  const mockSessionId = 'abc123';

  const createMockProject = (name: string): RushConfigurationProject => {
    const project = {
      _shouldPublish: true,
      _versionPolicy: null as VersionPolicy | null,
      _dependencyProjects: new Set<RushConfigurationProject>(),
      _consumingProjects: new Set<RushConfigurationProject>(),
      _packageJson: {},
      projectRelativeFolder: `packages/${name}`,
      projectRushConfigFolder: '/mock/rush/config',
      projectRushTempFolder: '/mock/rush/temp',
      tempProjectName: name,
      isMainProject: false,
      dependencyProjects: new Set<RushConfigurationProject>(),
      consumingProjects: new Set<RushConfigurationProject>(),
      shouldPublish: true,
      versionPolicyName: undefined as string | undefined,
      decoupledLocalDependencies: [] as string[],
      packageName: name,
      projectFolder: `/mock/project/${name}`,
      rushConfiguration: {} as any,
      reviewCategory: undefined as string | undefined,
      packageJson: {} as any,
      packageJsonEditor: {} as any,
      isPublished: true,
      statusValue: 0,
      statusMessage: '',
      cyclicDependencyProjects: new Set<RushConfigurationProject>(),
      localDependencyProjects: new Set<RushConfigurationProject>(),
    };
    return project as unknown as RushConfigurationProject;
  };

  const mockProject1 = createMockProject('package-1');
  const mockProject2 = createMockProject('package-2');

  const mockPackages = [mockProject1, mockProject2];
  const mockPublishManifests = [
    {
      project: mockProject1,
      currentVersion: '1.0.0',
      newVersion: '1.1.0',
    },
    {
      project: mockProject2,
      currentVersion: '2.0.0',
      newVersion: '2.1.0',
    },
  ];
  const mockChangedFiles = ['package.json', 'CHANGELOG.md'];

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SKIP_UNCOMMITTED_CHECK = 'false';

    // Setup default mocks
    vi.mocked(randomHash).mockReturnValue(mockSessionId);
    vi.mocked(getRushConfiguration).mockReturnValue({
      rushJsonFolder: mockRushFolder,
    } as any);
    vi.mocked(validateAndGetPackages).mockReturnValue(mockPackages);
    vi.mocked(generatePublishManifest).mockResolvedValue({
      manifests: mockPublishManifests,
      bumpPolicy: BumpType.PATCH,
    });
    vi.mocked(confirmForPublish).mockResolvedValue(true);
    vi.mocked(applyPublishManifest).mockResolvedValue(['package.json']);
    vi.mocked(generateChangelog).mockResolvedValue(['CHANGELOG.md']);
    vi.mocked(isMainBranch).mockResolvedValue(true);
  });

  it('should publish packages successfully', async () => {
    const options: PublishOptions = {
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    };

    await publish(options);

    // 验证流程
    expect(validateAndGetPackages).toHaveBeenCalledWith(options);
    expect(generatePublishManifest).toHaveBeenCalledWith(mockPackages, {
      ...options,
      sessionId: mockSessionId,
    });
    expect(confirmForPublish).toHaveBeenCalledWith(
      mockPublishManifests,
      false,
      {
        isReleaseMode: false,
        registry: 'https://registry.npmjs.org',
      },
    );
    expect(applyPublishManifest).toHaveBeenCalledWith(mockPublishManifests);
    expect(generateChangelog).toHaveBeenCalledWith(mockPublishManifests);
    expect(pushToRemote).toHaveBeenCalledWith({
      publishManifests: mockPublishManifests,
      bumpPolicy: BumpType.PATCH,
      sessionId: mockSessionId,
      changedFiles: mockChangedFiles,
      cwd: mockRushFolder,
      skipCommit: false,
      skipPush: false,
      repoUrl: 'git@github.com:example/repo.git',
    });
    expect(logger.success).toHaveBeenCalledWith('Publish success.');
  });

  it('should skip uncommitted changes check when SKIP_UNCOMMITTED_CHECK is true', async () => {
    process.env.SKIP_UNCOMMITTED_CHECK = 'true';
    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    });
    expect(ensureNotUncommittedChanges).not.toHaveBeenCalled();
  });

  it('should perform uncommitted changes check by default', async () => {
    process.env.SKIP_UNCOMMITTED_CHECK = 'false';
    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    });
    expect(ensureNotUncommittedChanges).toHaveBeenCalled();
  });

  it('should stop if no packages to publish', async () => {
    vi.mocked(validateAndGetPackages).mockImplementation(() => {
      throw new Error('No packages to publish');
    });

    await expect(
      publish({
        to: ['package-1'],
        repoUrl: 'git@github.com:example/repo.git',
      }),
    ).rejects.toThrow('No packages to publish');
    expect(generatePublishManifest).not.toHaveBeenCalled();
  });

  it('should stop if not in main branch for production release', async () => {
    vi.mocked(isMainBranch).mockResolvedValue(false);
    delete process.env.SKIP_BRANCH_CHECK;
    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    });
    expect(logger.error).toHaveBeenCalledWith(
      'You are not in main branch, please switch to main branch and try again.',
    );
    expect(applyPublishManifest).not.toHaveBeenCalled();
  });

  it('should skip branch check when SKIP_BRANCH_CHECK is true', async () => {
    vi.mocked(isMainBranch).mockResolvedValue(false);
    process.env.SKIP_BRANCH_CHECK = 'true';

    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    });

    expect(logger.error).not.toHaveBeenCalledWith(
      'You are not in main branch, please switch to main branch and try again.',
    );
    expect(applyPublishManifest).toHaveBeenCalled();

    delete process.env.SKIP_BRANCH_CHECK;
  });

  it('should allow non-main branch for beta releases', async () => {
    vi.mocked(isMainBranch).mockResolvedValue(false);
    vi.mocked(generatePublishManifest).mockResolvedValue({
      manifests: mockPublishManifests,
      bumpPolicy: BumpType.BETA,
    });

    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    });

    expect(logger.error).not.toHaveBeenCalled();
    expect(applyPublishManifest).toHaveBeenCalled();
  });

  it('should allow non-main branch for alpha releases', async () => {
    vi.mocked(isMainBranch).mockResolvedValue(false);
    vi.mocked(generatePublishManifest).mockResolvedValue({
      manifests: mockPublishManifests,
      bumpPolicy: BumpType.ALPHA,
    });

    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    });

    expect(logger.error).not.toHaveBeenCalled();
    expect(applyPublishManifest).toHaveBeenCalled();
  });

  it('should stop if user does not confirm', async () => {
    vi.mocked(confirmForPublish).mockResolvedValue(false);
    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    });
    expect(applyPublishManifest).not.toHaveBeenCalled();
    expect(generateChangelog).not.toHaveBeenCalled();
    expect(pushToRemote).not.toHaveBeenCalled();
  });

  it('should skip changelog generation for beta releases', async () => {
    vi.mocked(generatePublishManifest).mockResolvedValue({
      manifests: mockPublishManifests,
      bumpPolicy: BumpType.BETA,
    });

    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    });

    expect(applyPublishManifest).toHaveBeenCalled();
    expect(generateChangelog).not.toHaveBeenCalled();
    expect(pushToRemote).toHaveBeenCalledWith(
      expect.objectContaining({
        bumpPolicy: BumpType.BETA,
        changedFiles: ['package.json'], // 只有 package.json 被修改
      }),
    );
  });

  it('should skip changelog generation for alpha releases', async () => {
    vi.mocked(generatePublishManifest).mockResolvedValue({
      manifests: mockPublishManifests,
      bumpPolicy: BumpType.ALPHA,
    });

    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
    });

    expect(applyPublishManifest).toHaveBeenCalled();
    expect(generateChangelog).not.toHaveBeenCalled();
    expect(pushToRemote).toHaveBeenCalledWith(
      expect.objectContaining({
        bumpPolicy: BumpType.ALPHA,
        changedFiles: ['package.json'], // 只有 package.json 被修改
      }),
    );
  });

  it('should respect skipCommit option', async () => {
    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
      skipCommit: true,
    });
    expect(pushToRemote).toHaveBeenCalledWith(
      expect.objectContaining({
        skipCommit: true,
      }),
    );
  });

  it('should respect skipPush option', async () => {
    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
      skipPush: true,
    });
    expect(pushToRemote).toHaveBeenCalledWith(
      expect.objectContaining({
        skipPush: true,
      }),
    );
  });

  it('should respect dryRun option', async () => {
    await publish({
      to: ['package-1'],
      repoUrl: 'git@github.com:example/repo.git',
      dryRun: true,
    });
    expect(confirmForPublish).toHaveBeenCalledWith(mockPublishManifests, true, {
      isReleaseMode: false,
      registry: 'https://registry.npmjs.org',
    });
  });

  describe('release mode', () => {
    it('should skip uncommitted check when release is true', async () => {
      vi.mocked(generatePublishManifest).mockResolvedValue({
        manifests: mockPublishManifests,
        bumpPolicy: BumpType.BETA,
      });

      await publish({
        to: ['package-1'],
        repoUrl: 'git@github.com:example/repo.git',
        release: true,
      });

      expect(ensureNotUncommittedChanges).not.toHaveBeenCalled();
    });

    it('should call release function for beta version with release flag', async () => {
      vi.mocked(generatePublishManifest).mockResolvedValue({
        manifests: mockPublishManifests,
        bumpPolicy: BumpType.BETA,
      });

      await publish({
        to: ['package-1'],
        repoUrl: 'git@github.com:example/repo.git',
        release: true,
        registry: 'https://custom-registry.com',
      });

      expect(release).toHaveBeenCalledWith({
        dryRun: false,
        registry: 'https://custom-registry.com',
        packages: [
          { packageName: 'package-1', version: '1.1.0' },
          { packageName: 'package-2', version: '2.1.0' },
        ],
      });
      expect(pushToRemote).not.toHaveBeenCalled();
    });

    it('should call release function for alpha version with release flag', async () => {
      vi.mocked(generatePublishManifest).mockResolvedValue({
        manifests: mockPublishManifests,
        bumpPolicy: BumpType.ALPHA,
      });

      await publish({
        to: ['package-1'],
        repoUrl: 'git@github.com:example/repo.git',
        release: true,
        registry: 'https://registry.npmjs.org',
      });

      expect(release).toHaveBeenCalledWith({
        dryRun: false,
        registry: 'https://registry.npmjs.org',
        packages: [
          { packageName: 'package-1', version: '1.1.0' },
          { packageName: 'package-2', version: '2.1.0' },
        ],
      });
      expect(pushToRemote).not.toHaveBeenCalled();
    });

    it('should fall back to normal publish for production version with release flag', async () => {
      vi.mocked(generatePublishManifest).mockResolvedValue({
        manifests: mockPublishManifests,
        bumpPolicy: BumpType.PATCH,
      });

      await publish({
        to: ['package-1'],
        repoUrl: 'git@github.com:example/repo.git',
        release: true,
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Direct release (--release) is only allowed for alpha or beta versions.',
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'Falling back to normal publish mode...',
      );
      expect(release).not.toHaveBeenCalled();
      expect(pushToRemote).toHaveBeenCalled();
    });

    it('should use default registry when registry is not provided', async () => {
      vi.mocked(generatePublishManifest).mockResolvedValue({
        manifests: mockPublishManifests,
        bumpPolicy: BumpType.BETA,
      });

      await publish({
        to: ['package-1'],
        repoUrl: 'git@github.com:example/repo.git',
        release: true,
      });

      expect(release).toHaveBeenCalledWith({
        dryRun: false,
        registry: 'https://registry.npmjs.org',
        packages: expect.any(Array),
      });
    });

    it('should pass isReleaseMode to confirmForPublish', async () => {
      vi.mocked(generatePublishManifest).mockResolvedValue({
        manifests: mockPublishManifests,
        bumpPolicy: BumpType.BETA,
      });

      await publish({
        to: ['package-1'],
        repoUrl: 'git@github.com:example/repo.git',
        release: true,
        registry: 'https://custom-registry.com',
      });

      expect(confirmForPublish).toHaveBeenCalledWith(
        mockPublishManifests,
        false,
        {
          isReleaseMode: true,
          registry: 'https://custom-registry.com',
        },
      );
    });

    it('should respect dryRun in release mode', async () => {
      vi.mocked(generatePublishManifest).mockResolvedValue({
        manifests: mockPublishManifests,
        bumpPolicy: BumpType.ALPHA,
      });

      await publish({
        to: ['package-1'],
        repoUrl: 'git@github.com:example/repo.git',
        release: true,
        dryRun: true,
      });

      expect(release).toHaveBeenCalledWith({
        dryRun: true,
        registry: 'https://registry.npmjs.org',
        packages: expect.any(Array),
      });
    });
  });
});
