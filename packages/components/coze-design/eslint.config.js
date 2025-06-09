//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    'unicorn/filename-case': 'off',
    'no-restricted-imports': 'off',
    'max-len': [
      'error',
      {
        code: 150,
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
      },
    ],
    'max-lines': 'warn',
    '@typescript-eslint/no-empty-function': 'off',
  },
  ignores: [
    'src/typing/env/*',
    '**/routes_metadata',
    '**/output_resource',
    '**/dist_*',
  ],
});
