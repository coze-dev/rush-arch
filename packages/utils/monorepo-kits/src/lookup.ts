//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type {
  RushConfigurationProject,
  RushConfiguration,
} from '@rushstack/rush-sdk';

import { getRushConfiguration } from './rush-config';

export const lookupTo = (to: string) => {
  const cached = new Map<string, string[]>();
  const config = getRushConfiguration();
  const core = (pkgName: string) => {
    if (cached.has(pkgName)) {
      return cached.get(pkgName);
    }
    const result: string[] = [pkgName];
    cached.set(pkgName, result);
    const projects = config.projects.filter(p => p.packageName === pkgName);
    if (projects.length === 0) {
      throw new Error(`Project ${pkgName} not found`);
    }
    const project = projects[0];
    const deps = Array.from(project.dependencyProjects.values()).map(
      p => p.packageName,
    );
    result.push(...deps);
    deps.forEach(dep => {
      const subPkgs = core(dep);
      if (subPkgs) {
        result.push(...subPkgs);
      }
    });
    return result;
  };
  const result = core(to);
  return [...new Set(result)];
};

export const lookupFrom = (from: string) => {
  const cached = new Map<string, Set<string>>();
  const config = getRushConfiguration();
  const core = (pkgName: string) => {
    if (cached.has(pkgName)) {
      return cached.get(pkgName);
    }
    const result = new Set<string>();
    cached.set(pkgName, result);
    const projects = config.projects.filter(p => p.packageName === pkgName);
    if (projects.length === 0) {
      throw new Error(`Project ${pkgName} not found`);
    }
    const project = projects[0];
    const deps = Array.from([
      ...project.dependencyProjects.values(),
      ...project.consumingProjects.values(),
    ]).map(p => p.packageName);
    deps.forEach(dep => {
      result.add(dep);
      const subPkgs = cached.has(dep) ? cached.get(dep) : core(dep);
      if (subPkgs) {
        subPkgs.forEach(p => {
          result.add(p);
        });
      }
    });
    return result;
  };
  const result = core(from);
  return [...new Set(result)];
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
