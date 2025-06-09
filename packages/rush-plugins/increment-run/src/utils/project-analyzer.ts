//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { lookupProjectByFile } from '@coze-arch/monorepo-kits';

// { [package name]: [files] }
export const groupChangedFilesByProject = (
  changedFiles: string[],
): Record<string, string[]> => {
  const changedProjects: Record<string, string[]> = {};
  for (const file of changedFiles) {
    const project = lookupProjectByFile(file);
    if (project) {
      changedProjects[project.packageName] =
        changedProjects[project.packageName] || [];
      const group = changedProjects[project.packageName];
      group.push(file);
    }
  }
  return changedProjects;
};
