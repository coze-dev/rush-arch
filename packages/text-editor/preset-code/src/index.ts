import universal from '@coze-editor/preset-universal';
import {
  scrollBeyondLastLine,
  colorizationBrackets,
  matchingBrackets,
} from '@coze-editor/extensions';
import { scrollbar } from '@coze-editor/extension-scrollbar';
import { icons } from '@coze-editor/extension-completion-icons';
import { maxHeight, minHeight, height } from '@coze-editor/core-plugins';
import {
  api,
  extension,
  type InferEditorAPIFromPlugins,
  option,
} from '@coze-editor/core';
import {
  uriFacet,
  languageIdFacet,
  transformerFacet,
  textDocumentField,
  type Transformer,
} from '@coze-editor/code-language-shared';
import { EditorView, lineNumbers } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { foldGutter } from '@codemirror/language';

import { themes } from './themes';
import { vscodeDark, vscodeLight } from './theme-vscode';
import { languages } from './language-registry';
import { tabSize } from './extension/tab-size';
import { basicSetup } from './extension/basic-setup';
import createTheme, { type Theme } from './create-theme';
import { LINT_REFRESH_USER_EVENT } from './const';

import '@coze-editor/extension-scrollbar/dist/index.css';
import '@coze-editor/extension-completion-icons/dist/index.css';

const SVG_FOLD_CLOSE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M10.072 8.024L5.715 3.667l.618-.62L11 7.716v.618L6.333 13l-.618-.619z" clip-rule="evenodd"/></svg>';
const SVG_FOLD_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="m7.976 10.072l4.357-4.357l.62.618L8.284 11h-.618L3 6.333l.619-.618z" clip-rule="evenodd"/></svg>';

const preset = [
  ...universal,

  extension([
    basicSetup,
    matchingBrackets,
    // indentGuides(),
    icons,
    textDocumentField,

    Prec.low(
      EditorView.theme({
        '.cm-foldGutter .cm-gutterElement': {
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        },
      }),
    ),
    Prec.low(
      EditorView.theme({
        '.cm-link': {
          textDecoration: 'underline',
        },
      }),
    ),
    Prec.low(
      EditorView.theme({
        '.cm-tooltip': {
          borderRadius: '5px',
          fontSize: '12px',
        },
        '.cm-diagnostic-error': {
          borderLeft: 'none',
        },
        '.cm-diagnostic': {
          padding: '5px 10px',
        },
        '.cm-lineNumbers': {
          userSelect: 'none',
        },
        '.cm-tooltip.cm-tooltip-autocomplete > ul': {
          width: '264px',
          padding: '4px',
        },
        '.cm-completionInfo': {
          minWidth: '200px',
          margin: '0 2px',
        },
        '.cm-completionInfo p:last-child': {
          display: 'inline-block',
        },
        '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
          color: 'inherit',
        },
        '.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
          padding: '1px 9px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '5px',
        },
        '.cm-tooltip.cm-tooltip-autocomplete > ul > li:not(:first-child)': {
          marginTop: '2px',
        },
        '.cm-completionIcon': {
          fontSize: '11px',
          opacity: '1',
          display: 'flex',
        },
        '.cm-completionLabel': {
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        '.cm-completionDetail': {
          maxWidth: '86px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'right',
          fontStyle: 'initial',
        },
        '.cm-tooltip-autocomplete': {
          borderRadius: '8px',
        },
        '.cm-tooltip-hover': {
          overflowY: 'auto',
          maxHeight: '360px',
          wordBreak: 'break-word',
        },
        '.cm-tooltip-section:not(:first-child)': {
          'border-top': 'solid 0.5px #666666ab',
        },
      }),
    ),
  ]),

  option('tabSize', tabSize),
  option('height', height),
  option('minHeight', minHeight),
  option('maxHeight', maxHeight),
  option('scrollBeyondLastLine', (use?: boolean) =>
    use ? scrollBeyondLastLine() : [],
  ),
  option('uri', (id: string) => uriFacet.of(id)),
  option('theme', (themeName: string) => themes.get(themeName) ?? []),
  option('languageId', (id: string) => [
    languageIdFacet.of(id),
    languages.getExtension(id),
  ]),
  option('transformer', (transformer: Transformer) =>
    transformerFacet.of(transformer),
  ),
  option('overlayScrollbar', (enable = true) => (enable ? [scrollbar()] : [])),
  option('lineNumbersGutter', (enable = true) =>
    enable
      ? lineNumbers({
          domEventHandlers: {
            // avoid blur
            mousedown: (view, line, event: Event) => {
              event.preventDefault();
              return false;
            },
          },
        })
      : [],
  ),
  option('foldGutter', (enable = true) =>
    enable
      ? foldGutter({
          markerDOM(open: boolean) {
            const dom = document.createElement('div');
            dom.innerHTML = open ? SVG_FOLD_OPEN : SVG_FOLD_CLOSE;
            return dom;
          },
          domEventHandlers: {
            // avoid blur
            mousedown: (view, line, event: Event) => {
              event.preventDefault();
              return false;
            },
          },
        })
      : [],
  ),
  option('colorizeBrackets', (enable = true) =>
    enable ? colorizationBrackets : [],
  ),

  api('validate', ({ view }) => () => {
    view.dispatch({
      userEvent: LINT_REFRESH_USER_EVENT,
    });
  }),
];

type EditorAPI = InferEditorAPIFromPlugins<typeof preset>;

themes.register('_light', vscodeLight);
themes.register('_dark', vscodeDark);

export { languages, themes, createTheme };

export { transformerCreator } from './transformer';

export type { Theme, EditorAPI, Transformer };

export default preset;

export { tags } from '@lezer/highlight';
