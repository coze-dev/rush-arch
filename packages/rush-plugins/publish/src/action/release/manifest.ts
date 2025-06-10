//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { getRushConfiguration } from '../../utils/get-rush-config';
import { type ReleaseManifest, type PackageToPublish } from './types';

/**
 * 构建发布依赖树
 */
export function buildReleaseManifest(
  packages: PackageToPublish[],
): ReleaseManifest[] {
  const rushConfiguration = getRushConfiguration();
  return packages
    .map(pkg => {
      const project = rushConfiguration.getProjectByName(pkg.packageName);
      if (!project) {
        throw new Error(`Cannot find project: ${pkg.packageName}`);
      }
      if (project.shouldPublish) {
        return { project, version: project.packageJson.version };
      }
      return undefined;
    })
    .filter(Boolean) as ReleaseManifest[];
}
