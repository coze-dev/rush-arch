//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/react.ts',
    'src/react-merge.ts',
    'src/preset-universal.ts',
    'src/preset-universal-code.ts',
    'src/preset-none.ts',
    'src/preset-expression.ts',
    'src/preset-prompt.ts',
    'src/preset-variable.ts',
    'src/preset-code.ts',
    'src/preset-code-languages.ts',
    'src/preset-chat.ts',
    'src/language-typescript.ts',
    'src/language-typescript-worker.ts',
    'src/language-json.ts',
    'src/language-shell.ts',
    'src/language-python.ts',
    'src/language-sql.ts',
    'src/vscode.ts',
    'src/vscode-search.ts',
    'src/vscode-themes.ts',
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
      strict: true,
      alwaysStrict: true,
    },
  },
});
