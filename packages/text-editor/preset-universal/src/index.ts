//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { updateWholeDecorations } from '@coze-editor/extensions';
import {
  focus,
  blur,
  setValue,
  getValue,
  eventChange,
  disableKeybindings,
  placeholder,
  replaceText,
  editable,
  readOnly,
  fontSize,
  eventFocus,
  focusChangeNotifier,
  disableKeybindingsField,
  getCursorPosition,
  setCursorPosition,
  eventBlur,
  lineWrapping,
  eventSelectionChange,
  height,
  minHeight,
  maxHeight,
  undo,
  redo,
  transformTextInSelection,
  getLineInfoAtPosition,
  getSelection,
  valueExtension,
  value,
} from '@coze-editor/core-plugins';
import {
  option,
  api,
  event,
  type InferEditorAPIFromPlugins,
  extension,
  domEventHandler,
} from '@coze-editor/core';

const preset = [
  extension([disableKeybindingsField, focusChangeNotifier]),

  option('fontSize', fontSize),
  option('placeholder', placeholder),
  option('readOnly', readOnly),
  option('editable', editable),
  option('lineWrapping', lineWrapping),
  option('height', height),
  option('minHeight', minHeight),
  option('maxHeight', maxHeight),
  extension(valueExtension),
  option('value', value),

  api('getValue', getValue),
  api('setValue', setValue),
  api('replaceText', replaceText),
  api('getCursorPosition', getCursorPosition),
  api('setCursorPosition', setCursorPosition),
  api('focus', focus),
  api('blur', blur),
  api('disableKeybindings', disableKeybindings),
  api('updateASTDecorations', ({ view }) => () => {
    updateWholeDecorations(view);
  }),
  api('undo', undo),
  api('redo', redo),
  api('transformTextInSelection', transformTextInSelection),
  api('getSelection', getSelection),
  api('getLineInfoAtPosition', getLineInfoAtPosition),

  event('selectionChange', eventSelectionChange),
  event('change', eventChange),
  event('focus', eventFocus),
  event('blur', eventBlur),
  domEventHandler('mousedown'),
  domEventHandler('mouseup'),
];

type EditorAPI = InferEditorAPIFromPlugins<typeof preset>;

export default preset;
export type { EditorAPI };
