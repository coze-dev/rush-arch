import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts'
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
