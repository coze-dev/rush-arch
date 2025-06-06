import path from 'path';

import { readJsonFile } from '@coze-arch/fs-enhance';

import { type AuditRule, type AuditDetectResult } from '../types';

interface PackageJson {
  scripts?: Record<string, string>;
}

const DEFAULT_NO_SCRIPTS = ['postinstall', 'prepare'];
const DEFAULT_REQUIRED_SCRIPTS = [{ name: 'lint', pattern: /eslint/ }];

type ScriptRule =
  | string
  | {
      name: string;
      pattern?: string | RegExp;
    };

// Enhanced types
interface ScriptValidationResult {
  isValid: boolean;
  message?: string;
}

interface ScriptValidator {
  validate: (
    scriptName: string,
    scriptValue: string | undefined,
  ) => ScriptValidationResult;
}

// Script validators
class RequiredScriptValidator implements ScriptValidator {
  constructor(private pattern?: string | RegExp) {}

  validate(
    scriptName: string,
    scriptValue: string | undefined,
  ): ScriptValidationResult {
    if (!scriptValue) {
      return {
        isValid: false,
        message: `Required script "${scriptName}" is missing in package.json`,
      };
    }

    if (this.pattern) {
      const pattern =
        this.pattern instanceof RegExp
          ? this.pattern
          : new RegExp(this.pattern);
      if (!pattern.test(scriptValue)) {
        return {
          isValid: false,
          message: `Script "${scriptName}" value does not match required pattern: ${pattern}`,
        };
      }
    }

    return { isValid: true };
  }
}

class ForbiddenScriptValidator implements ScriptValidator {
  validate(
    scriptName: string,
    scriptValue: string | undefined,
  ): ScriptValidationResult {
    if (scriptValue) {
      return {
        isValid: false,
        message: `Script "${scriptName}" should not exist in package.json`,
      };
    }
    return { isValid: true };
  }
}

export const checkPkgConfig: AuditRule<{
  noScripts: string[];
  requiredScripts: ScriptRule[];
}> = {
  name: 'pkg-config',
  async fn(project, config?) {
    const { projectFolder } = project;
    const noScripts = config?.noScripts || DEFAULT_NO_SCRIPTS;
    const requiredScripts = config?.requiredScripts || DEFAULT_REQUIRED_SCRIPTS;

    const pkgConfig = (await readJsonFile(
      path.resolve(projectFolder, 'package.json'),
    )) as PackageJson;

    const results: AuditDetectResult[] = [];

    // Validate forbidden scripts
    noScripts.forEach(script => {
      const validator = new ForbiddenScriptValidator();
      const result = validator.validate(script, pkgConfig.scripts?.[script]);
      if (!result.isValid && result.message) {
        results.push({ content: result.message });
      }
    });

    // Validate required scripts
    requiredScripts.forEach(scriptRule => {
      const scriptName =
        typeof scriptRule === 'string' ? scriptRule : scriptRule.name;
      const pattern =
        typeof scriptRule === 'object' ? scriptRule.pattern : undefined;

      const validator = new RequiredScriptValidator(pattern);
      const result = validator.validate(
        scriptName,
        pkgConfig.scripts?.[scriptName],
      );
      if (!result.isValid && result.message) {
        results.push({ content: result.message });
      }
    });

    return results;
  },
};
