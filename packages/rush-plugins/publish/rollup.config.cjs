//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT
require('sucrase/register/ts');
const { defineConfig } = require('@coze-arch/build-lib-preset');

module.exports = defineConfig({
  rootDir: process.cwd(),
});
