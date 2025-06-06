#!/usr/bin/env node

const path = require('path');
require('sucrase/register/ts');

require(path.resolve(__dirname, 'index.ts'));
