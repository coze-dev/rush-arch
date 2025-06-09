//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';

import { type LintResult } from 'stylelint';
import { lookupOnly } from '@coze-arch/monorepo-kits';
import { logger } from '@coze-arch/logger';

import { runLintInProject } from './stylelint';
import { report } from './report';

// 目前只需要针对这两部分文件做检测
const ALLOW_EXTS = ['.less', '.css'];

export const runStylelint = async (
  changedFileGroup: Record<string, string[]>,
): Promise<void> => {
  const projects = Object.keys(changedFileGroup);
  logger.info(
    `Try run stylelint at ${
      projects.length
    } projects, and covers ${projects.reduce(
      (acc, p) => acc + changedFileGroup[p].length,
      0,
    )} files.`,
  );
  const results = (
    await Promise.all(
      projects.map(async packageName => {
        const project = lookupOnly(packageName);
        const { projectRelativeFolder, projectFolder } = project;
        const files = changedFileGroup[packageName]
          .filter(r => ALLOW_EXTS.findIndex(e => r.endsWith(e)) >= 0)
          .map(r => path.relative(projectRelativeFolder, r));
        if (files.length <= 0) {
          return undefined;
        }
        const errors = await runLintInProject({
          cwd: projectFolder,
          files,
        });
        logger.info(
          `Finish run at ${packageName} with ${errors.length} errors.`,
        );
        return { packageName, errors, files, projectFolder };
      }),
    )
  )
    .filter(Boolean)
    .flat() as {
    packageName: string;
    errors: LintResult[];
    files: string[];
    projectFolder: string;
  }[];
  await report(results, 'Stylelint Detect Report');
};
