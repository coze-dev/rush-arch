import { type Command } from 'commander';

import { logger } from '../../utils/logger';
import { getCurrentOrigin } from '../../utils/git';
import { type InstallAction } from '../../types';
import { type PublishOptions } from './types';
import { GIT_REPO_URL_REGEX } from './const';
import { publish } from './action';

export const installAction: InstallAction = (program: Command) => {
  program
    .command('pub')
    .description('Generate new version and create release branch.')
    .option('-v, --version <string>', 'Specify publish version')
    .option('-d, --dry-run', 'Enable dry run mode', false)
    .option(
      '-t, --to <packages...>',
      'Publish specified packages and their downstream dependencies',
    )
    .option(
      '-f, --from <packages...>',
      'Publish specified packages and their upstream/downstream dependencies',
    )
    .option('-o, --only <packages...>', 'Only publish specified packages')
    .option('-s, --skip-commit', 'Skip git commit', false)
    .option('-p, --skip-push', 'Skip git push', false)
    .option(
      '-b, --bump-type <type>',
      'Version bump type (alpha/beta/patch/minor/major)',
      /^(alpha|beta|patch|minor|major)$/,
    )
    .option(
      '--repo-url <url>',
      'Git repository URL (e.g. git@github.com:coze-dev/coze-js.git)',
      undefined,
    )
    .action(async (options: PublishOptions) => {
      try {
        const repoUrl = options.repoUrl || (await getCurrentOrigin());
        if (!repoUrl) {
          throw new Error('Git repository URL is required');
        }
        if (!GIT_REPO_URL_REGEX.test(repoUrl)) {
          throw new Error(
            `Invalid git repository URL: ${repoUrl}, it should be follow the format: git@github.com:\${org}/\${repo}.git`,
          );
        }
        const normalizeOptions = {
          ...options,
          repoUrl,
        };
        await publish(normalizeOptions);
      } catch (error) {
        logger.error('Publish failed!');
        logger.error((error as Error).message);
      }
    });
};
