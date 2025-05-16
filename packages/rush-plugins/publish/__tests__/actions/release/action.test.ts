import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type RushConfigurationProject } from '@rushstack/rush-sdk';

import { getCurrentBranchName } from '@/utils/git';
import { exec } from '@/utils/exec';
import {
  type ReleaseOptions,
  type PackageToPublish,
} from '@/action/release/types';
import { releasePackages } from '@/action/release/release';
import { checkReleasePlan } from '@/action/release/plan';
import { buildReleaseManifest } from '@/action/release/manifest';
import { getPackagesToPublish } from '@/action/release/git';
import { release } from '@/action/release/action';

// Mock dependencies
vi.mock('@/utils/git');
vi.mock('@/utils/exec');
vi.mock('@/action/release/release');
vi.mock('@/action/release/plan');
vi.mock('@/action/release/manifest');
vi.mock('@/action/release/git');

describe('release action', () => {
  const mockCommit = 'abc123';
  const mockBranchName = 'main';
  const mockRegistry = 'https://registry.npmjs.org/';

  const createMockProject = (name: string): RushConfigurationProject => {
    const project = {
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
      packageName: name,
      projectFolder: `/mock/project/${name}`,
      rushConfiguration: {} as any,
      reviewCategory: undefined,
      packageJson: {} as any,
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

  const mockProject1 = createMockProject('package-1');
  const mockProject2 = createMockProject('package-2');

  const mockPackagesToPublish: PackageToPublish[] = [
    {
      packageName: 'package-1',
      version: '1.1.0',
    },
    {
      packageName: 'package-2',
      version: '2.1.0',
    },
  ];

  const mockReleaseManifests = [
    {
      project: mockProject1,
      version: '1.1.0',
    },
    {
      project: mockProject2,
      version: '2.1.0',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(exec).mockResolvedValue({ stdout: '', stderr: '', code: 0 });
    vi.mocked(getCurrentBranchName).mockResolvedValue(mockBranchName);
    vi.mocked(getPackagesToPublish).mockResolvedValue(mockPackagesToPublish);
    vi.mocked(buildReleaseManifest).mockReturnValue(mockReleaseManifests);
    vi.mocked(checkReleasePlan).mockReturnValue(undefined);
    vi.mocked(releasePackages).mockResolvedValue(undefined);
  });

  it('should release packages successfully', async () => {
    const options: ReleaseOptions = {
      commit: mockCommit,
      registry: mockRegistry,
    };

    await release(options);

    // 验证流程
    expect(exec).toHaveBeenCalledWith(`git checkout ${mockCommit}`);
    expect(getPackagesToPublish).toHaveBeenCalledWith(mockCommit);
    expect(buildReleaseManifest).toHaveBeenCalledWith(mockPackagesToPublish);
    expect(getCurrentBranchName).toHaveBeenCalled();
    expect(checkReleasePlan).toHaveBeenCalledWith(
      mockReleaseManifests,
      mockBranchName,
    );
    expect(releasePackages).toHaveBeenCalledWith(mockReleaseManifests, {
      commit: mockCommit,
      dryRun: false,
      registry: mockRegistry,
    });
  });

  it('should handle no packages to publish', async () => {
    vi.mocked(getPackagesToPublish).mockResolvedValue([]);

    await release({ commit: mockCommit, registry: mockRegistry });

    expect(buildReleaseManifest).not.toHaveBeenCalled();
    expect(checkReleasePlan).not.toHaveBeenCalled();
    expect(releasePackages).not.toHaveBeenCalled();
  });

  it('should respect dryRun option', async () => {
    await release({ commit: mockCommit, dryRun: true, registry: mockRegistry });

    expect(releasePackages).toHaveBeenCalledWith(mockReleaseManifests, {
      commit: mockCommit,
      dryRun: true,
      registry: mockRegistry,
    });
  });

  it('should respect registry option', async () => {
    await release({ commit: mockCommit, registry: mockRegistry });

    expect(releasePackages).toHaveBeenCalledWith(mockReleaseManifests, {
      commit: mockCommit,
      dryRun: false,
      registry: mockRegistry,
    });
  });

  it('should handle release plan check error', async () => {
    vi.mocked(checkReleasePlan).mockImplementation(() => {
      throw new Error('Invalid release plan');
    });

    await expect(
      release({ commit: mockCommit, registry: mockRegistry }),
    ).rejects.toThrow('Invalid release plan');
    expect(releasePackages).not.toHaveBeenCalled();
  });

  it('should handle release packages error', async () => {
    vi.mocked(releasePackages).mockRejectedValue(new Error('Release failed'));

    await expect(
      release({ commit: mockCommit, registry: mockRegistry }),
    ).rejects.toThrow('Release failed');
  });
});
