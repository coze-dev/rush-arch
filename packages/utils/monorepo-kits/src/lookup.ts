//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type {
  RushConfigurationProject,
  RushConfiguration,
} from '@rushstack/rush-sdk';

import { getRushConfiguration } from './rush-config';

export const lookupTo = (to: string) => {
  const config = getRushConfiguration();
  const projects = config.projects.filter(p => p.packageName === to);
  if (projects.length === 0) {
    throw new Error(`Project ${to} not found`);
  }
  const project = projects[0];
  const deps = Array.from(project.dependencyProjects.values()).map(
    p => p.packageName,
  );
  return deps;
};

export const lookupFrom = (from: string) => {
  const config = getRushConfiguration();
  const projects = config.projects.filter(p => p.packageName === from);
  if (projects.length === 0) {
    throw new Error(`Project ${from} not found`);
  }
};

export const lookupOnly = (packageName: string) => {
  const config = getRushConfiguration();
  const projects = config.projects.filter(p => p.packageName === packageName);
  if (projects.length === 0) {
    throw new Error(`Project ${packageName} not found`);
  }
  return projects[0];
};

export const lookupProjectByFile = (
  file: string,
): RushConfigurationProject | undefined => {
  const config = getRushConfiguration();
  const lookup = config.getProjectLookupForRoot(config.rushJsonFolder);
  return lookup.findChildPath(file);
};

export const lookupProjectsByFiles = (
  files: string[] | string,
): RushConfigurationProject[] => {
  const rushConfiguration: RushConfiguration = getRushConfiguration();
  const affectedFiles = typeof files === 'string' ? [files] : files;
  const changedProjects: Set<RushConfigurationProject> = new Set();
  const lookup = rushConfiguration.getProjectLookupForRoot(
    rushConfiguration.rushJsonFolder,
  );

  for (const file of affectedFiles) {
    const project = lookup.findChildPath(file);
    if (project) {
      if (!changedProjects.has(project)) {
        changedProjects.add(project);
      }
    }
  }
  return [...changedProjects];
};
