import { languages } from '@coze-editor/editor/preset-code'
import { typescript } from '@coze-editor/editor/language-typescript'
import { json } from '@coze-editor/editor/language-json'

languages.register('typescript', typescript)
languages.register('json', json)

typescript.languageService.addExtraFiles({
  '/global-types.d.ts': `
    declare global {
      interface Args {
        params: {
          input: string;
        };
      }

      interface Output {
        key: string;
        object: {
          field: string;
          dynamic: number;
        }
      }
    }

    export {}
  `,
  // '/node_modules/@types/pkg/index.d.ts': `
  //   export const foo: string
  // `,
  // '/global.d.ts': `
  //   declare const inputs: {
  //     hello: string;
  //   };
  //   declare const outputs: {
  //     data: string;
  //   }
  // `,
})

const tsWorker = new Worker(
  new URL(`@coze-editor/editor/language-typescript/worker`, import.meta.url),
  { type: 'module' }
)

typescript.languageService.initialize(tsWorker, {
  compilerOptions: {
    // eliminate Promise error
    lib: ['es2015', 'dom'],
  },
})
