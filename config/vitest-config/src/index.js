//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

require('sucrase/register/ts');

process.env.VITE_CJS_IGNORE_WARNING = true;
const { defineConfig } = require('./define-config');

module.exports = { defineConfig };
