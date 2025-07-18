//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';

import { type RushConfigurationProject } from '@rushstack/rush-sdk';
import { readJsonFile, writeJsonFile } from '@coze-arch/fs-enhance';

import { getRushConfiguration } from '../../utils/get-rush-config';

type PackageJson = Record<string, unknown> & {
  cozePublishConfig?: Record<string, unknown>;
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

const applyCozePublishConfig: PrehandleJob = async (
  packageJson: PackageJson,
) => {
  const { cozePublishConfig } = packageJson;
  if (cozePublishConfig) {
    const keys = Object.keys(cozePublishConfig);
    for (const key of keys) {
      packageJson[key] = cozePublishConfig[key];
    }
  }
  return Promise.resolve(packageJson);
};

export const applyPublishConfig = async (project: RushConfigurationProject) => {
  const jobs: PrehandleJob[] = [
    updateDependencyVersions,
    applyCozePublishConfig,
  ];
  const packageJsonPath = path.join(project.projectFolder, 'package.json');
  let packageJson = await readJsonFile<PackageJson>(packageJsonPath);
  for (const job of jobs) {
    packageJson = await job(packageJson);
  }
  await writeJsonFile(packageJsonPath, packageJson);
};
