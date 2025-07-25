//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type RushConfigurationProject } from '@rushstack/rush-sdk';

import { getRushConfiguration } from './rush-config';

export const lookupSubPackages = (() => {
  const cachedSubPackages = new Map();

  return (packageName: string): string[] => {
    if (cachedSubPackages.has(packageName)) {
      return cachedSubPackages.get(packageName);
    }
    const rushConfig = getRushConfiguration();
    const project = rushConfig.projects.find(
      p => p.packageName === packageName,
    );
    if (!project) {
      throw new Error(`Project ${packageName} not found`);
    }
    const deps = Array.from(project.dependencyProjects.values()).map(
      p => p.packageName,
    );
    const subPackages: string[] = [];
    for (const dep of deps) {
      subPackages.push(dep);
      const descendants = lookupSubPackages(dep);
      subPackages.push(...descendants);
    }
    const result = Array.from(new Set(subPackages));
    cachedSubPackages.set(packageName, result);
    return result;
  };
})();

export const getPackageLocation = (packageName: string): string => {
  const rushConfig = getRushConfiguration();
  const project = rushConfig.projects.find(p => p.packageName === packageName);
  if (!project) {
    throw new Error(`Project ${packageName} not found`);
  }
  return project.projectFolder;
};

export const getPackageJson = (
  packageName: string,
): RushConfigurationProject['packageJson'] => {
  const rushConfig = getRushConfiguration();
  const project = rushConfig.projects.find(p => p.packageName === packageName);
  if (!project) {
    throw new Error(`Project ${packageName} not found`);
  }
  return project.packageJson;
};
