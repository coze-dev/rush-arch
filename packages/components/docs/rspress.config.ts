import path from 'path';

import { defineConfig, type UserConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginSass } from '@rsbuild/plugin-sass';
import { SemiRspackPlugin } from '@douyinfe/semi-rspack-plugin';
import PkgRootWebpackPlugin from '@coze-arch/pkg-root-webpack-plugin';
import { getRushConfiguration } from '@coze-arch/monorepo-kits';

const packageDirs = getRushConfiguration().projects.map(p => p.projectFolder);

const config: UserConfig = defineConfig({
  root: 'docs',
  globalStyles: path.join(__dirname, 'docs/styles/global.css'),
  ssg: false,
  builderConfig: {
    output: {
      sourceMap: {
        css: true,
      },
    },
    tools: {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      rspack: (config, { appendPlugins, appendRules }) => {
        config.resolve.extensions = [
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.json',
          '.mjs',
          '.mdx',
          '.md',
        ];

        appendPlugins([
          new PkgRootWebpackPlugin({
            packagesDirs: packageDirs,
          }),
          new SemiRspackPlugin({
            theme: '@coze-arch/semi-theme-hand01',
          }),
        ]);
      },
    },

    source: {
      tsconfigPath: './tsconfig.rspress.json',
      alias: {
        '@coze-arch/semi-theme-hand01': path.dirname(
          require.resolve('@coze-arch/semi-theme-hand01/package.json'),
        ),
      },
    },
  },

  builderPlugins: [
    //@ts-expect-error -- ignore
    pluginSass({
      sassLoaderOptions: {
        sassOptions: {
          silenceDeprecations: ['import', 'global-builtin'],
          api: 'legacy',
          sourceMap: true,
        },
      },
    }),
  ],
  plugins: [
    // TODO: 等待v2优化
    // pluginPlayground({ defaultDirection: 'vertical' }),
    pluginPreview({
      defaultRenderMode: 'pure',
    }),
  ],
  themeDir: path.join(__dirname, 'docs/theme'),
  logo: '/logo.svg',
  icon: '/logo.svg',
  title: 'Coze Design',
  description: '基于 Coze Design System 2.0 视觉设计系统的组件库',
  logoText: 'Coze Design',
  route: {
    cleanUrls: true,
  },
  themeConfig: {
    searchPlaceholderText: '搜索文档',
    searchNoResultsText: '没有找到相关结果',
    searchSuggestedQueryText: '请换一个搜索词试试',
    prevPageText: '上一页',
    nextPageText: '下一页',
    enableAppearanceAnimation: true,
    outlineTitle: '本页内容',
  },
});

export default config;
