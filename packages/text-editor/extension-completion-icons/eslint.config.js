//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

const { defineWebConfig } = require('@coze-editor/eslint-config');

module.exports = defineWebConfig({
  packageRoot: __dirname,
  ignores: [
    'svg',
    'scripts',
  ],
});
