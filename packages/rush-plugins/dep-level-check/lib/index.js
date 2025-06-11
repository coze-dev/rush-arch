'use strict';

//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

/**
 * 日志工具
 *
 * 提供统一的日志输出接口，支持不同级别的日志，包括彩色输出
 */

// 日志级别枚举
var LogLevel; (function (LogLevel) {
  const DEBUG = 0; LogLevel[LogLevel["DEBUG"] = DEBUG] = "DEBUG";
  const INFO = 1; LogLevel[LogLevel["INFO"] = INFO] = "INFO";
  const WARN = 2; LogLevel[LogLevel["WARN"] = WARN] = "WARN";
  const ERROR = 3; LogLevel[LogLevel["ERROR"] = ERROR] = "ERROR";
  const SUCCESS = 4; LogLevel[LogLevel["SUCCESS"] = SUCCESS] = "SUCCESS";
  const NONE = 5; LogLevel[LogLevel["NONE"] = NONE] = "NONE"; // 用于完全禁用日志
})(LogLevel || (LogLevel = {}));

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  debug: '\x1b[36m', // 青色
  info: '\x1b[34m', // 蓝色
  warn: '\x1b[33m', // 黄色
  error: '\x1b[31m', // 红色
  success: '\x1b[32m', // 绿色
};

// 默认日志级别
let currentLogLevel = LogLevel.INFO;

/**
 * 基础日志函数
 * @param level 日志级别
 * @param message 日志消息
 * @param showPrefix 是否显示前缀，默认为 true
 */
function log(level, message, showPrefix = true) {
  if (level < currentLogLevel) {
    return;
  }

  let prefix = '';
  let color = '';

  switch (level) {
    case LogLevel.DEBUG: {
      prefix = '[DEBUG]';
      color = colors.debug;
      break;
    }
    case LogLevel.WARN: {
      prefix = '[WARN]';
      color = colors.warn;
      break;
    }
    case LogLevel.ERROR: {
      prefix = '[ERROR]';
      color = colors.error;
      break;
    }
    case LogLevel.SUCCESS: {
      prefix = '[SUCCESS]';
      color = colors.success;
      break;
    }
    case LogLevel.INFO:
    default: {
      prefix = '[INFO]';
      color = colors.info;
      break;
    }
  }

  // 格式化日志前缀
  const formattedPrefix = showPrefix ? `${color}${prefix}${colors.reset} ` : '';

  // 输出日志
  console.log(`${formattedPrefix}${message}`);
}

/**
 * 导出的日志工具
 */
const logger = {
  /**
   * 调试日志
   * @param message 日志消息
   * @param showPrefix 是否显示前缀，默认为 true
   */
  debug(message, showPrefix = true) {
    log(LogLevel.DEBUG, message, showPrefix);
  },

  /**
   * 信息日志
   * @param message 日志消息
   * @param showPrefix 是否显示前缀，默认为 true
   */
  info(message, showPrefix = true) {
    log(LogLevel.INFO, message, showPrefix);
  },

  /**
   * 警告日志
   * @param message 日志消息
   * @param showPrefix 是否显示前缀，默认为 true
   */
  warn(message, showPrefix = true) {
    log(LogLevel.WARN, message, showPrefix);
  },

  /**
   * 错误日志
   * @param message 日志消息
   * @param showPrefix 是否显示前缀，默认为 true
   */
  error(message, showPrefix = true) {
    log(LogLevel.ERROR, message, showPrefix);
  },

  /**
   * 成功日志
   * @param message 日志消息
   * @param showPrefix 是否显示前缀，默认为 true
   */
  success(message, showPrefix = true) {
    log(LogLevel.SUCCESS, message, showPrefix);
  },
};

function isValidLevel(v) {
  return Number.isInteger(v);
}

function parseTagsLevel(tags) {
  const level = [...tags].find(tag => tag.startsWith('level-'));
  return level ? parseInt(level.split('-')[1]) : null;
}

function isDepLevelMatch(
  projectLevel,
  dependencyLevel,
) {
  return projectLevel >= dependencyLevel;
}

const PLUGIN_NAME = 'RushDepLevelPlugin';

class RushDepLevelPlugin {
   apply(
    rushSession,
    rushConfiguration,
  ) {
    rushSession.hooks.beforeInstall.tap(PLUGIN_NAME, () => {
      const startTime = process.hrtime();
      const { projects } = rushConfiguration;

      logger.info(
        `[${PLUGIN_NAME}] Validating dependency levels for ${projects.length} projects...`,
      );

      for (const project of projects) {
        // find workspace dependencies
        const workspaceDependencies = [...project.dependencyProjects];

        // Get project tags
        const projectTags = project.tags || [];
        const projectLevel = parseTagsLevel(projectTags);

        if (!isValidLevel(projectLevel)) {
          const errorMessage = `[${PLUGIN_NAME}] ${project.packageName} 没有配置level tag，请在rush.json中配置tags字段`;
          logger.error(errorMessage);
          process.exit(1);
        }

        // Check each workspace dependency
        for (const depProject of workspaceDependencies) {
          const depLevel = parseTagsLevel(depProject.tags);

          if (!isValidLevel(depLevel)) {
            const errorMessage = `[${PLUGIN_NAME}] ${project.packageName} 依赖的 ${depProject.packageName} 没有配置level tag，请在rush.json中配置tags字段。`;
            logger.error(errorMessage);
            process.exit(1);
          }

          // Validate dependency level
          if (!isDepLevelMatch(projectLevel, depLevel)) {
            const errorMessage = `[${PLUGIN_NAME}] ${project.packageName} 的依赖级别不匹配：项目级别为level-${projectLevel}，依赖 "${depProject.packageName}" 级别为level-${depLevel}。项目只能依赖相同或更低级别的包，请在rush.json调整tags字段配置。`;
            logger.error(errorMessage);
            process.exit(1);
          }
        }
      }

      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
      logger.info(
        `[${PLUGIN_NAME}] Dependency level validation completed in ${totalTimeMs}ms`,
      );
    });
  }
}

module.exports = RushDepLevelPlugin;
