//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type { RushConfigurationProject } from '@coze-arch/monorepo-kits';

import { readConfig } from './utils/read-config';
import { type RuleReport } from './types';
import { AuditEngine } from './engine';

export const auditPackage = async (project: RushConfigurationProject) => {
  const { projectFolder } = project;
  const config = await readConfig(projectFolder);
  const engine = new AuditEngine({
    ...config,
    project,
  });
  const result = await engine.run();
  return result;
};

export type AuditPackageReports = RuleReport[];
