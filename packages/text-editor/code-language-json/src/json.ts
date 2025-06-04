import { parser } from '@text-editor/lezer-parser-json';
import {
  continuedIndent,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  LRLanguage,
} from '@codemirror/language';

/// A language provider that provides JSON parsing.
export const jsonLanguage = LRLanguage.define({
  name: 'json',
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Object: continuedIndent({ except: /^\s*\}/ }),
        Array: continuedIndent({ except: /^\s*\]/ }),
      }),
      foldNodeProp.add({
        'Object Array': foldInside,
      }),
    ],
  }),
  languageData: {
    closeBrackets: { brackets: ['[', '{', '"', "'"] },

    indentOnInput: /^\s*[\}\]]$/,
  },
});
