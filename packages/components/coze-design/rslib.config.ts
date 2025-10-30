//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';

import tailwindNesting from 'tailwindcss/nesting';
import tailwindcss from 'tailwindcss';
import postcssNesting from 'postcss-nesting';
import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';
import isPseudoClass from '@csstools/postcss-is-pseudo-class';

type RsbuildConfig = Parameters<typeof defineConfig>[0];

const commonConfig: Partial<RsbuildConfig> = {
  source: {
    entry: {
      index: [
        './src/**',
        '!**/*.stories.tsx',
        '!**/*.test.tsx',
        '!**/*.mdx',
        '!**/__template__/**/*',
        '!**/test-utils',
      ],
    },
    exclude: [],
    tsconfigPath: path.resolve(__dirname, './tsconfig.build.json'),
  },
  bundle: false,
  dts: {
    distPath: path.resolve(__dirname, './dist/types'),
    bundle: false,
    build: true,
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [
          postcssImport(),
          tailwindNesting(postcssNesting),
          tailwindcss({
            config: path.resolve(__dirname, 'tailwind.config.js'),
          }),
          autoprefixer(),
          isPseudoClass(),
        ],
      },
    },
  },
};

const formats: Partial<RsbuildConfig>[] = [
  {
    format: 'esm',
    output: {
      distPath: {
        root: path.resolve(__dirname, './dist/esm'),
      },
    },
  },
  {
    dts: false,
    format: 'cjs',
    output: {
      distPath: {
        root: path.resolve(__dirname, './dist/cjs'),
      },
    },
  },
].map(r => ({ ...commonConfig, ...r }));

export default defineConfig({
  lib: formats,
  output: {
    target: 'web',
    cleanDistPath: true,
  },
  plugins: [pluginReact({ swcReactOptions: {} })],
});
