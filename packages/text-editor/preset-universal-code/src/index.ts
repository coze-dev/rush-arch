//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  scrollBeyondLastLine,
  colorizationBrackets,
  matchingBrackets,
} from '@coze-editor/extensions';
import { scrollbar } from '@coze-editor/extension-scrollbar';
import { maxHeight, minHeight, height } from '@coze-editor/core-plugins';
import {
  extension,
  type InferEditorAPIFromPlugins,
  option,
} from '@coze-editor/core';
import { EditorView, lineNumbers } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { foldGutter, indentUnit } from '@codemirror/language';

import { basicSetup } from './extension';

import '@coze-editor/extension-scrollbar/dist/index.css';

const SVG_FOLD_CLOSE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M10.072 8.024L5.715 3.667l.618-.62L11 7.716v.618L6.333 13l-.618-.619z" clip-rule="evenodd"/></svg>';
const SVG_FOLD_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="m7.976 10.072l4.357-4.357l.62.618L8.284 11h-.618L3 6.333l.619-.618z" clip-rule="evenodd"/></svg>';

const tabSize = (value?: number) => [
  EditorState.tabSize.of(value ?? 2),
  indentUnit.of(' '.repeat(value ?? 2)),
];

const preset = [
  extension([
    basicSetup,
    matchingBrackets,

    Prec.low(
      EditorView.theme({
        '.cm-foldGutter .cm-gutterElement': {
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
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
];

type EditorAPI = InferEditorAPIFromPlugins<typeof preset>;

export type { EditorAPI };

export default preset;
