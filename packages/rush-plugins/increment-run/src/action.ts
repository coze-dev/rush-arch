import { logger } from '@coze-arch/logger';

import { groupChangedFilesByProject } from './utils/project-analyzer';
import { runStylelint } from './stylelint';
import { runPackageAudit } from './package-audit';
import { runLint } from './lint';
import { runCommonCommands } from './common-command';

export const incrementAction = async (options: {
  changedFiles: string[];
  action: string;
  verbose: boolean;
}): Promise<void> => {
  const { changedFiles, action, verbose } = options;
  if (!changedFiles.length) {
    return;
  }

  const changedFileGroup = groupChangedFilesByProject(changedFiles);
  const packages = Object.keys(changedFileGroup);
  packages.forEach(k => {
    logger.debug(` - ${k}`, false);
  });
  if (packages.length === 0) {
    return;
  }
  switch (action) {
    case 'lint': {
      await runLint(changedFileGroup);
      break;
    }
    case 'style': {
      await runStylelint(changedFileGroup);
      break;
    }
    case 'package-audit': {
      await runPackageAudit(changedFileGroup);
      break;
    }
    default: {
      await runCommonCommands(packages, action, verbose);
      break;
    }
  }
};
