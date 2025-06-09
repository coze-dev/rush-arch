//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { parser } from '@coze-editor/lezer-parser-json';
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
