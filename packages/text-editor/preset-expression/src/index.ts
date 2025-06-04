import { updateWholeDecorations, inputRules } from '@text-editor/extensions';
import {
  basic,
  fontSize,
  getValue,
  setValue,
  focus,
  blur,
  eventChange,
  eventFocus,
  eventBlur,
  eventSelectionChange,
  getView,
  eventViewUpdate,
  matchBefore,
  placeholder,
  readOnly,
  replaceTextByRange,
  getCursorPosition,
  setCursorPosition,
  disableKeybindings,
  disableKeybindingsField,
  contentAttributes,
  getSelection,
  focusChangeNotifier,
  isFocused,
  editable,
} from '@text-editor/core-plugins';
import {
  option,
  api,
  event,
  extension,
  type InferEditorAPIFromPlugins,
  domEventHandler,
} from '@text-editor/core';
import { highlightSpecialChars, keymap, EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  indentUnit,
} from '@codemirror/language';
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands';
import { closeBrackets } from '@codemirror/autocomplete';

const sharedPreset = [
  extension([
    highlightSpecialChars(),
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    EditorState.tabSize.of(2),
    indentUnit.of(' '.repeat(2)),
    EditorView.lineWrapping,
    basic(),
    focusChangeNotifier,
  ]),

  option('fontSize', fontSize),
  option('placeholder', placeholder),
  option('readOnly', readOnly),
  option('editable', editable),
  option('inputRules', inputRules),
  option('contentAttributes', contentAttributes),

  event('change', eventChange),
  event('focus', eventFocus),
  event('blur', eventBlur),
  event('selectionChange', eventSelectionChange),
  event('viewUpdate', eventViewUpdate),
  domEventHandler('compositionstart'),
  domEventHandler('compositionend'),
  domEventHandler('mousedown'),
  domEventHandler('mouseup'),

  // 需组合使用
  extension(disableKeybindingsField),
  api('disableKeybindings', disableKeybindings),
  api('getView', getView),
  api('matchBefore', matchBefore),
  api('updateWholeDecorations', ({ view }) => () => {
    updateWholeDecorations(view);
  }),
  api('getValue', getValue),
  api('setValue', setValue),
  api('focus', focus),
  api('blur', blur),
  api('isFocused', isFocused),
  api('getCursorPosition', getCursorPosition),
  api('setCursorPosition', setCursorPosition),
  api('getSelection', getSelection),
  api('replaceTextByRange', replaceTextByRange),
];

const preset = [
  ...sharedPreset,
  extension([
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    closeBrackets(),
  ]),
];

type EditorAPI = InferEditorAPIFromPlugins<typeof preset>;

export { sharedPreset };
export default preset;
export type { EditorAPI };
