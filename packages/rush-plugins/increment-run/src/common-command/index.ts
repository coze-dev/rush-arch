//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { exec } from 'shelljs';
import { getRushConfiguration } from '@coze-arch/monorepo-kits';
import { logger } from '@coze-arch/logger';

export const runCommonCommands = (options: {
  packages: string[];
  action: string;
  verbose: boolean;
  prefix?: string;
}): void => {
  const { packages, action, verbose, prefix = '--from' } = options;
  const rushConfiguration = getRushConfiguration();
  const postfix: string[] = [];
  if (verbose) {
    postfix.push('--verbose');
  }
  if (action === 'install') {
    postfix.push('--to', 'tag:core');
  }
  const args = [
    'common/scripts/install-run-rush',
    action,
    ...packages.map(name => [prefix, name]).flat(),
    ...postfix,
  ];

  const start = performance.now();
  const command = `node ${args.join(' ')}`;
  logger.info(`Start running: ${command}`);
  const res = exec(command, {
    cwd: rushConfiguration.rushJsonFolder,
    fatal: false,
  });
  logger[res.code === 0 ? 'info' : 'error'](
    `finish exec command with exit code: ${res.code}, time: ${
      performance.now() - start
    }ms`,
  );
  process.exitCode = res.code;
};
