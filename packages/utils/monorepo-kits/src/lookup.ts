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

export const lookupProjectsByFiles = (
  files: string[] | string,
): RushConfigurationProject[] => {
  const rushConfiguration: RushConfiguration = getRushConfiguration();
  const changedFiles = typeof files === 'string' ? [files] : files;
  const changedProjects: Set<RushConfigurationProject> = new Set();
  const lookup = rushConfiguration.getProjectLookupForRoot(
    rushConfiguration.rushJsonFolder,
  );

  for (const file of changedFiles) {
    const project = lookup.findChildPath(file);
    if (project) {
      if (!changedProjects.has(project)) {
        changedProjects.add(project);
      }
    }
  }
  return [...changedProjects];
};
