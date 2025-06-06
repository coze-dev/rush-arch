import { inputRules } from '@coze-editor/extensions';
import { replaceTextByRange } from '@coze-editor/core-plugins';
import { LanguageSupport } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';

import { promptLanguage, markdownLanguage, support } from './languages/prompt';

const brackets = ["'", '"', '{', '[', '('];

const autoCloseBrackets = [
  closeBrackets(),
  promptLanguage.data.of({
    closeBrackets: {
      brackets,
    },
  }),

  markdownLanguage.data.of({
    closeBrackets: {
      brackets,
    },
  }),

  inputRules([
    {
      type: 'character',
      triggerCharacter: '%',
      handler({ view, from, to }) {
        const previousChar = view.state.sliceDoc(Math.max(0, from - 1), from);
        const nextChar = view.state.sliceDoc(
          from,
          Math.min(from + 1, view.state.doc.length),
        );
        if (previousChar === '{' && nextChar === '}') {
          replaceTextByRange({ view })({
            from,
            to,
            text: '%%',
            cursorOffset: -1,
          });
          return true;
        }

        return false;
      },
    },
    {
      type: 'character',
      triggerCharacter: '#',
      handler({ view, from, to }) {
        const previousChar = view.state.sliceDoc(Math.max(0, from - 1), from);
        const nextChar = view.state.sliceDoc(
          from,
          Math.min(from + 1, view.state.doc.length),
        );
        if (previousChar === '{' && nextChar === '}') {
          replaceTextByRange({ view })({
            from,
            to,
            text: '##',
            cursorOffset: -1,
          });
          return true;
        }

        return false;
      },
    },
  ]),
];

const languageSupport = new LanguageSupport(promptLanguage, [
  support,
  autoCloseBrackets,
]);

export { promptLanguage, markdownLanguage, languageSupport };
