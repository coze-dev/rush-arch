import { parser as pyParser } from '@lezer/python';
import { parser as jsParser } from '@lezer/javascript';
import {
  extension,
  type InferEditorAPIFromPlugins,
  option,
} from '@coze-editor/core';
import { LRLanguage } from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';

import {
  IdentifierKind,
  type Scope,
  type SearchParams,
  scopeFacet,
} from './service';
import expression from './expression';
import { completion } from './completion';

const javascriptLanguage = LRLanguage.define({
  parser: jsParser,
  languageData: {
    autocomplete: completion,
    closeBrackets: { brackets: ['(', '[', '{', "'", '"', '`'] },
    commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
  },
});

const pythonLanguage = LRLanguage.define({
  parser: pyParser,
  languageData: {
    autocomplete: completion,
    closeBrackets: {
      brackets: ['(', '[', '{', "'", '"', "'''", '"""'],
      stringPrefixes: [
        'f',
        'fr',
        'rf',
        'r',
        'u',
        'b',
        'br',
        'rb',
        'F',
        'FR',
        'RF',
        'R',
        'U',
        'B',
        'BR',
        'RB',
      ],
    },
    commentTokens: { line: '#' },
  },
});

const languageId = (languageId?: 'javascript' | 'python') => {
  switch (languageId) {
    case 'python':
      return [pythonLanguage];
    case 'javascript':
      return [javascriptLanguage];
  }

  return [];
};

const scope = (scope?: Scope) => (scope ? [scopeFacet.of(scope)] : []);

const preset = [
  ...expression,
  option('languageId', languageId),
  option('scope', scope),
  extension([
    autocompletion({
      filterStrict: false,
    }),
    closeBrackets(),
    // EditorView.theme({
    //   '.cm-tooltip-autocomplete': {
    //     backgroundColor: '#ffffff',
    //     border: 'solid 1px #eee',
    //     borderRadius: '3px',
    //   },
    //   '.cm-tooltip.cm-tooltip-autocomplete > ul': {
    //     padding: '5px'
    //   },
    //   '.cm-tooltip-autocomplete ul li[aria-selected]': {
    //     background: '#42a5f8',
    //     borderRadius: '3px',
    //   },
    // }),
  ]),
];

type EditorAPI = InferEditorAPIFromPlugins<typeof preset>;

export default preset;

export { IdentifierKind };

export type { Scope, SearchParams, EditorAPI };
