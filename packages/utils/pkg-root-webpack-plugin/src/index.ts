import path from 'path';
import fs from 'fs';

import { type Compiler } from 'webpack';

const toAbsolute = (root: string, file: string) => {
  if (fs.existsSync(path.join(root, 'src'))) {
    return path.join(root, 'src', file);
  }
  return path.join(root, file);
};

interface PkgRootWebpackPluginOptions {
  // 根目录符号，默认为 `@`
  root: string;
  // 需要排除的packages根目录
  excludeFolders: string[];
  packagesDirs: string[];
}

class PkgRootWebpackPlugin {
  private options: PkgRootWebpackPluginOptions;

  constructor(options?: Partial<PkgRootWebpackPluginOptions>) {
    if (!options?.packagesDirs) {
      throw new Error('packagesDir is required');
    }

    this.options = {
      packagesDirs: options.packagesDirs,
      root: options?.root || '@',
      excludeFolders: options?.excludeFolders || [],
    };
  }

  apply(compiler: Compiler) {
    const target = compiler.hooks.normalModuleFactory;
    target.tap('PkgRootWebpackPlugin', nmf => {
      nmf.hooks.beforeResolve.tapAsync(
        'PkgRootWebpackPlugin',
        (request, callback) => {
          const innerRequest = request.request;

          if (!innerRequest) {
            return callback();
          }
          const { root, excludeFolders = [], packagesDirs } = this.options;
          const { context } = request;
          if (innerRequest.startsWith(`${root}/`)) {
            const folder = packagesDirs.find(
              fold =>
                context.indexOf(`${fold}/`) !== -1 &&
                !excludeFolders.includes(`${fold}/`),
            );
            if (!folder) {
              return callback();
            }
            const absolutePath = toAbsolute(
              context.slice(0, context.indexOf(folder) + folder.length),
              innerRequest.slice(root.length),
            );
            request.request = absolutePath;
          }
          return callback();
        },
      );
    });
  }
}

export default PkgRootWebpackPlugin;

export { PkgRootWebpackPlugin };
