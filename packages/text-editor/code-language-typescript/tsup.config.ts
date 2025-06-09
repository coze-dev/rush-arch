//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/worker.ts',
  ],
  format: ['cjs', 'esm'],
  sourcemap: true,
  legacyOutput: true,
  clean: true,
  dts: {
    resolve: true,
    compilerOptions: {
      composite: false,
      moduleResolution: 'bundler',
      module: 'esnext',
    },
  },
});
