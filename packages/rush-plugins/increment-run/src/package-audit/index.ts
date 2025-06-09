//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { auditPackage } from '@coze-arch/package-audit';
import { lookupOnly } from '@coze-arch/monorepo-kits';

import { report } from './report';

export const runPackageAudit = async (
  changedFileGroup: Record<string, string[]>,
) => {
  const packages = Object.keys(changedFileGroup);

  const diagnostics = (
    await Promise.all(
      packages.map(async packageName => {
        const project = lookupOnly(packageName);
        const res = await auditPackage(project);
        return res;
      }),
    )
  ).flat();
  // keep this for debugging
  // const diagnostics = (
  //   await Promise.all(rushConfiguration.projects.map(r => auditPackage(r)))
  // ).flat();

  await report(diagnostics);
};
