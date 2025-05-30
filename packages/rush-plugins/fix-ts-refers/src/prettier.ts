import path from 'path';

import { format as _format, resolveConfig, resolveConfigFile } from 'prettier';
import { getRushConfiguration } from '@coze-arch/monorepo-kits';

const resolvePrettierConfig = async (filepath?: string) => {
  try {
    let prettierConfigFile;
    if (typeof filepath === 'string') {
      prettierConfigFile = await resolveConfigFile(filepath);
    } else {
      const config = getRushConfiguration();
      const root = config.rushJsonFolder;
      prettierConfigFile = path.resolve(root, '.prettierrc.js');
    }
    const prettierConfig = await resolveConfig(prettierConfigFile, {
      useCache: true,
      editorconfig: true,
    });
    return { ...prettierConfig };
  } catch {
    return undefined;
  }
};

export const format = async (code: string, filepath?: string) => {
  const config = await resolvePrettierConfig(filepath);
  return config ? _format(code, { ...config, filepath }) : code;
};
