import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/react.ts',
    'src/preset-universal.ts',
    'src/preset-none.ts',
    'src/preset-expression.ts',
    'src/preset-prompt.ts',
    'src/preset-variable.ts',
    'src/preset-code.ts',
    'src/language-typescript.ts',
    'src/language-typescript-worker.ts',
    'src/language-json.ts',
    'src/language-shell.ts',
    'src/language-python.ts',
    'src/vscode.ts'
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
