//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';

import { type RushConfigurationProject } from '@rushstack/rush-sdk';
import { logger } from '@coze-arch/logger';
import { readJsonFile, writeJsonFile } from '@coze-arch/fs-enhance';

import { type PublishManifest, type ApplyPublishManifest } from './types';

const updatePackageVersion = async (
  project: RushConfigurationProject,
  newVersion: string,
): Promise<string> => {
  const packageJsonPath = path.resolve(project.projectFolder, 'package.json');
  const packageJson = await readJsonFile<{ version: string }>(packageJsonPath);
  packageJson.version = newVersion;
  await writeJsonFile(packageJsonPath, packageJson);
  return packageJsonPath;
};

export const applyPublishManifest: ApplyPublishManifest = async (
  manifests: PublishManifest[],
): Promise<string[]> => {
  const modifiedFiles: string[] = await Promise.all(
    manifests.map(async manifest => {
      const { project, newVersion } = manifest;

      const modifiedFile = await updatePackageVersion(project, newVersion);
      return modifiedFile;
    }),
  );
  logger.info(
    `Updated version for packages: ${manifests.map(m => m.project.packageName).join(', ')}`,
  );
  return modifiedFiles;
};
