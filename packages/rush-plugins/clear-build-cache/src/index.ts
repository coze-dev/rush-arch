import path from 'node:path';
import fs from 'node:fs';

import JSON5 from 'json5';
import { getRushConfiguration } from '@coze-arch/monorepo-kits';

// 定义 rush-project.json 中操作设置的接口
interface OperationSetting {
  operationName: string;
  outputFolderNames?: string[];
  [key: string]: unknown;
}

// 定义 rush-project.json 的接口
interface RushProjectConfiguration {
  operationSettings?: OperationSetting[];
  [key: string]: unknown;
}

const kAllowedProjectOutputFolders: Set<string> = new Set();

function main() {
  const config = getRushConfiguration();
  const REPO_ROOT: string = config.rushJsonFolder;
  const { projects } = config;

  // 清理 common/temp/build-cache 的目录
  const buildCacheFolder: string = path.join(
    REPO_ROOT,
    'common/temp/build-cache',
  );
  if (fs.existsSync(buildCacheFolder)) {
    fs.rmdirSync(buildCacheFolder, { recursive: true });
    console.log('Clean %s', 'common/temp/build-cache');
  }
  // 重建 common/temp/build-cache 的目录
  fs.mkdirSync(buildCacheFolder, { recursive: true });

  for (const project of projects) {
    const { projectFolder } = project;

    // 清理 tsbuildinfo 文件
    const tsbuildinfoFiles: readonly string[] = [
      'tsconfig.tsbuildinfo',
      'tsconfig.build.tsbuildinfo',
      '.eslintcache',
    ] as const;

    for (const filename of tsbuildinfoFiles) {
      const tsbuildinfoFile: string = path.join(projectFolder, filename);
      if (fs.existsSync(tsbuildinfoFile)) {
        fs.unlinkSync(tsbuildinfoFile);
        console.log('Clean %s/%s', projectFolder, filename);
      }
    }

    // 清理 rush-project.json 里面配置的内容
    const rushProjectJsonFile: string = path.join(
      projectFolder,
      'config/rush-project.json',
    );

    if (fs.existsSync(rushProjectJsonFile)) {
      const rushProjectConfigContent: string = fs.readFileSync(
        rushProjectJsonFile,
        'utf-8',
      );
      const rushProjectJson: RushProjectConfiguration = JSON5.parse(
        rushProjectConfigContent,
      );
      const operationSettings: OperationSetting[] =
        rushProjectJson.operationSettings || [];

      for (const operationSetting of operationSettings) {
        const outputFolderNames: string[] =
          operationSetting.outputFolderNames || [];
        for (const outputFolderName of outputFolderNames) {
          const outputFolder: string = path.join(
            projectFolder,
            outputFolderName,
          );
          const outputFolderKey = `${projectFolder}/${outputFolderName}`;

          if (
            fs.existsSync(outputFolder) &&
            !kAllowedProjectOutputFolders.has(outputFolderKey)
          ) {
            fs.rmdirSync(outputFolder, { recursive: true });
            console.log('Clean %s/%s', projectFolder, outputFolderName);
          }
        }
      }
    }
  }
}

main();
