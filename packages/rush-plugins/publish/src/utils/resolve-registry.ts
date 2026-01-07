//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type RushConfigurationProject } from '@rushstack/rush-sdk';
import { logger } from '@coze-arch/logger';

/**
 * package.json 的类型定义
 */
interface PackageJson {
  publishConfig?: {
    registry?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * 解析发布 registry 的优先级：
 * 1. 命令行参数 --registry (最高优先级)
 * 2. package.json 中的 publishConfig.registry
 * 3. 使用 npm 配置的默认 registry (不传 --registry 参数)
 *
 * @param project - Rush 项目配置
 * @param registryFromCli - 命令行参数传入的 registry
 * @returns 解析后的 registry URL，如果为 undefined 则使用 npm 默认配置
 */
export function resolveRegistry(
  project: RushConfigurationProject,
  registryFromCli?: string,
): string | undefined {
  // 1. 优先使用命令行参数
  if (registryFromCli) {
    logger.info(
      `Using registry from CLI: ${registryFromCli} (${project.packageName})`,
      false,
    );
    return registryFromCli;
  }

  // 2. 尝试读取 package.json 中的 publishConfig.registry
  const packageJson = project.packageJson as unknown as PackageJson;
  const registryFromPackageJson = packageJson.publishConfig?.registry;

  if (registryFromPackageJson) {
    logger.info(
      `Using registry from publishConfig: ${registryFromPackageJson} (${project.packageName})`,
      false,
    );
    return registryFromPackageJson;
  }

  // 3. 返回 undefined，让 npm 使用自己配置的 registry
  logger.info(`Using npm configured registry (${project.packageName})`, false);
  return undefined;
}
