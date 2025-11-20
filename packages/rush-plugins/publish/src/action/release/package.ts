//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';

import { type RushConfigurationProject } from '@rushstack/rush-sdk';
import { readJsonFile, writeJsonFile } from '@coze-arch/fs-enhance';

import { getRushConfiguration } from '../../utils/get-rush-config';

type PackageJson = Record<string, unknown> & {
  cozePublishConfig?: Record<string, unknown>;
  botPublishConfig?: Record<string, unknown>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
type PrehandleJob = (packageJson: PackageJson) => Promise<PackageJson>;

/**
 * 更新依赖版本
 */
const updateDependencyVersions: PrehandleJob = async (
  packageJson: PackageJson,
) => {
  const rushConfiguration = getRushConfiguration();
  const depTypes = ['dependencies', 'peerDependencies'];
  for (const depType of depTypes) {
    if (packageJson[depType]) {
      for (const [dep, ver] of Object.entries(packageJson[depType])) {
        const project = rushConfiguration.getProjectByName(dep);
        if (/^workspace:/.test(ver) && project) {
          packageJson[depType][dep] = project.packageJson.version;
        }
      }
    }
  }
  return Promise.resolve(packageJson);
};

/**
 * 应用发布配置
 * 优先使用 botPublishConfig，如果不存在则使用 cozePublishConfig
 */
const applyPublishConfigSettings: PrehandleJob = async (
  packageJson: PackageJson,
) => {
  // 优先使用 botPublishConfig，如果不存在则回退到 cozePublishConfig
  const publishConfig =
    packageJson.botPublishConfig ?? packageJson.cozePublishConfig;

  if (publishConfig) {
    const keys = Object.keys(publishConfig);
    for (const key of keys) {
      packageJson[key] = publishConfig[key];
    }
  }
  return Promise.resolve(packageJson);
};

export const applyPublishConfig = async (project: RushConfigurationProject) => {
  const jobs: PrehandleJob[] = [
    updateDependencyVersions,
    applyPublishConfigSettings,
  ];
  const packageJsonPath = path.join(project.projectFolder, 'package.json');
  let packageJson = await readJsonFile<PackageJson>(packageJsonPath);
  for (const job of jobs) {
    packageJson = await job(packageJson);
  }
  await writeJsonFile(packageJsonPath, packageJson);
};
