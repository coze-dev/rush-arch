//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightSpecialChars,
  keymap,
  rectangularSelection,
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import {
  defaultHighlightStyle,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';

export const basicSetup = (() => [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  EditorView.clickAddsSelectionRange.of(e => e.altKey),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  keymap.of([
    ...defaultKeymap,
    ...closeBracketsKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    indentWithTab,
    { key: 'Tab', run: acceptCompletion },
  ]),
])();
