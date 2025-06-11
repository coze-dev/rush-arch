//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';

import * as githubActions from '@actions/core';

import { isCI } from './env';

function isGitHubActions() {
  return process.env.GITHUB_ACTIONS === 'true';
}

const gitlabActions = {
  setOutput: (key: string, value: string): void => {
    console.log(`::set-output name=${key}::${value}`);
  },
  exportVariable: (envName: string, envValue: string): void => {
    console.log(`::set-env name=${envName}::${envValue}`);
  },
  addMessage: (level: CIMessageLevel, message: string): void => {
    console.log(`::add-message level=${level}::${message}`);
  },
  addIssue: (issue: CIIssueDef): void => {
    console.log(`::add-issue name=${issue.rule}::${issue.message}`);
  },
};

const core = isGitHubActions() ? githubActions : gitlabActions;

const appendToStepSummary = async (content: string) => {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    throw new Error('GITHUB_STEP_SUMMARY 环境变量未定义');
  }

  await fs.appendFile(summaryPath, `${content}\n`);
};

export const setOutput = (key: string, value: string): void => {
  core.setOutput(key, value);
};

export const setEnv = (envName: string, envValue: string): void => {
  core.exportVariable(envName, envValue);
};

export const addReport = async (message: CIReportDefinition): Promise<void> => {
  const { output, conclusion, name } = message;
  const formattedMsg = { ...message, conclusion };

  if (conclusion) {
    setOutput('conclusion', conclusion);
  }

  if (isGitHubActions()) {
    // TODO: ignore warning for now
    if (conclusion === CIReportConclusion.FAILED) {
      await appendToStepSummary(output.summary);
      setEnv('REPORT_RESULT', 'failed');
      githubActions.setFailed(`${name} FAILED`);
    }
  } else {
    const tmpReportFile = path.resolve(
      os.tmpdir(),
      `ci-${formattedMsg.name.replace(/[\s/]/g, '_')}-${Date.now()}.${
        isCI() ? 'json' : 'md'
      }`,
    );
    await fs.writeFile(
      tmpReportFile,
      // 出于调试方便，本地环境直接输出 md 内容
      isCI()
        ? JSON.stringify(formattedMsg, null, '  ')
        : formattedMsg.output.summary,
      'utf-8',
    );
    console.log(`::update-check-run ::${tmpReportFile}`);
  }
};

export const addIssue = (issue: CIIssueDef): void => {
  const { rule, message, line, path: file, severity } = issue;
  if (isGitHubActions()) {
    const severityActionMap = {
      error: githubActions.error,
      warning: githubActions.warning,
      info: githubActions.notice,
    } as const;

    const config = {
      file,
      startLine: line,
      endLine: line,
      title: rule,
    };

    severityActionMap[severity](message, config);
  } else {
    const msg = `::add-issue path=${file},line=${line},severity=${severity},rule=${rule}::${message}`;
    console.log(msg);
  }
};

export enum CIMessageLevel {
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning',
}

export enum CIReportConclusion {
  SUCCESS = 'success',
  WARNING = 'warning',
  FAILED = 'failed',
}

interface CIReportDefinition {
  name: string;
  details_url?: string;
  conclusion?: CIReportConclusion;
  output: {
    summary: string;
    description?: string;
  };
}

export interface CIIssueDef {
  rule: string;
  severity: 'info' | 'warning' | 'error';
  // file path relative to repo root.
  path?: string;
  line?: number;
  message: string;
}
