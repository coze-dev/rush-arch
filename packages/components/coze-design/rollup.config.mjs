//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { fileURLToPath } from 'url';
import path from 'path';

import tailwindcss from 'tailwindcss';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcssNesting from 'postcss-nesting';
import postcssImport from 'postcss-import';
import { glob } from 'glob';
import autoprefixer from 'autoprefixer';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import isPseudoClass from '@csstools/postcss-is-pseudo-class';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取所有源文件作为入口点（保持目录结构）
const input = Object.fromEntries(
  glob
    .sync('src/**/*.{ts,tsx}', {
      ignore: [
        '**/*.stories.tsx',
        '**/*.test.tsx',
        '**/*.test.ts',
        '**/*.d.ts',
        '**/*.mdx',
        '**/__template__/**/*',
        '**/test-utils/**/*',
        '**/__tests__/**/*',
      ],
    })
    .map(file => [
      // 移除 src/ 前缀和文件扩展名作为入口点名称
      path.relative(
        'src',
        file.slice(0, file.length - path.extname(file).length),
      ),
      // 完整路径作为入口
      fileURLToPath(new URL(file, import.meta.url)),
    ]),
);

// 共享的插件配置
const postcssPlugin = postcss({
  plugins: [
    postcssImport(),
    postcssNesting(),
    tailwindcss({
      config: path.resolve(__dirname, 'tailwind.config.js'),
    }),
    autoprefixer(),
    isPseudoClass(),
  ],
  extract: false, // 将 CSS 内联到 JS 文件中
  modules: false,
  autoModules: false,
  minimize: false,
  inject: {
    insertAt: 'top',
  },
});

const createTypescriptPlugin = (outDir, declaration = true) =>
  typescript({
    tsconfig: path.resolve(__dirname, './tsconfig.build.json'),
    compilerOptions: {
      declaration,
      declarationMap: false,
      sourceMap: false,
      outDir,
      composite: false, // 在 rollup 构建时禁用 composite
    },
  });

// ESM 配置
const esmConfig = {
  input,
  output: {
    dir: 'dist/esm',
    format: 'esm',
    entryFileNames: '[name].mjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: false,
  },
  external: [/node_modules/, /@coze-arch\//, /@douyinfe\//],
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    }),
    commonjs(),
    createTypescriptPlugin('dist/esm', true),
    postcssPlugin,
    preserveDirectives({
      exclude: [/\.d\.ts$/, /node_modules/],
    }),
  ],
  onwarn(warning, warn) {
    // 忽略 "use client" 指令警告
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
      return;
    }
    warn(warning);
  },
};

// CJS 配置
const cjsConfig = {
  input,
  output: {
    dir: 'dist/cjs',
    format: 'cjs',
    entryFileNames: '[name].js',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: false,
    exports: 'named',
  },
  external: [/node_modules/, /@coze-arch\//, /@douyinfe\//],
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    }),
    commonjs(),
    createTypescriptPlugin('dist/cjs', false),
    postcss({
      plugins: [
        postcssImport(),
        postcssNesting(),
        tailwindcss({
          config: path.resolve(__dirname, 'tailwind.config.js'),
        }),
        autoprefixer(),
        isPseudoClass(),
      ],
      extract: false,
      modules: false,
      autoModules: false,
      minimize: false,
      inject: {
        insertAt: 'top',
      },
    }),
  ],
  onwarn(warning, warn) {
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
      return;
    }
    warn(warning);
  },
};

export default [esmConfig, cjsConfig];
