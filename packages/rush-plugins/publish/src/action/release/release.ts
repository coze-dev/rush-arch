//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type RushConfigurationProject } from '@rushstack/rush-sdk';
import { logger } from '@coze-arch/logger';

import { resolveRegistry } from '../../utils/resolve-registry';
import { exec } from '../../utils/exec';
import { type ReleaseManifest, type ReleaseOptions } from './types';
import { applyPublishConfig } from './package';

/**
 * 发布包
 */
const publishPackage = async (
  project: RushConfigurationProject,
  releaseOptions: ReleaseOptions,
): Promise<void> => {
  const { dryRun } = releaseOptions;
  const token = process.env.NPM_AUTH_TOKEN;
  const { version } = project.packageJson;
  const tag = version.includes('alpha')
    ? 'alpha'
    : version.includes('beta')
      ? 'beta'
      : 'latest';

  // 解析 registry：CLI 参数 > package.json publishConfig > npm 配置
  const registry = resolveRegistry(project, releaseOptions.registry);

  // 使用环境变量传递 authToken，npm 会自动应用到任何 registry
  const args = [`NODE_AUTH_TOKEN=${token}`, 'npm', 'publish', `--tag ${tag}`];
  if (dryRun) {
    args.push('--dry-run');
  }
  // 只有明确指定了 registry 才传递参数，否则使用 npm 配置的默认值
  if (registry) {
    args.push(`--registry=${registry}`);
  }

  await exec(args.join(' '), {
    cwd: project.projectFolder,
  });

  logger.success(`- Published ${project.packageName}@${version}`);
};

const releasePackage = async (
  releaseManifest: ReleaseManifest,
  releaseOptions: ReleaseOptions,
) => {
  const { project } = releaseManifest;
  const { packageName } = project;
  logger.info(`Preparing release for package: ${packageName}`);
  await applyPublishConfig(project);
  await publishPackage(project, releaseOptions);
};

const buildProjects = async (releaseManifests: ReleaseManifest[]) => {
  const packageNames = releaseManifests.map(
    manifest => manifest.project.packageName,
  );
  const buildCommands = `rush build ${packageNames.map(name => `--to ${name}`).join(' ')}`;
  await exec(buildCommands);
};

export const releasePackages = async (
  releaseManifests: ReleaseManifest[],
  releaseOptions: ReleaseOptions,
) => {
  await buildProjects(releaseManifests);
  await Promise.all(
    releaseManifests.map(async manifest => {
      await releasePackage(manifest, releaseOptions);
    }),
  );
};
