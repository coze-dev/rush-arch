import { api, extension, option } from '@coze-editor/core';
import { EditorView } from '@codemirror/view';
import { EditorSelection, StateEffect, StateField } from '@codemirror/state';

import { type EditorElement, toElementString } from './schema';
import {
  chatExtension,
  type ElementsDefinition,
  elementsFacet,
} from './extension';

const focusedEffect = StateEffect.define();

const focusedField = StateField.define<boolean>({
  create() {
    return false;
  },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(focusedEffect)) {
        return true;
      }
    }

    return value;
  },
});

function insertElement({ view }: { view: EditorView }) {
  return (element: Omit<EditorElement, 'type'>) => {
    let selection = view.state.selection.main;

    const hasFocused = view.state.field(focusedField, false);
    if (hasFocused === false) {
      selection = EditorSelection.cursor(view.state.doc.length);
    }

    const insert = toElementString(element);
    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert,
      },
      selection: EditorSelection.cursor(selection.from + insert.length),
    });
  };
}

// 如果用了 drawSelection 且 widget 内的 React 组件宽度发生变化，光标位置会异常
// 原因：drawSelection 感知不到 react 组件渲染导致的光标位置变化，需手动通知
function refreshDrawSelection({ view }: { view: EditorView }) {
  return () => {
    view.dispatch({
      selection: view.state.selection,
    });
  };
}

const plugins = [
  extension([
    focusedField,
    EditorView.domEventObservers({
      click(e, view) {
        view.dispatch({
          effects: focusedEffect.of(null),
        });
      },
    }),
    chatExtension(),
  ]),
  api('insertElement', insertElement),
  api('refreshDrawSelection', refreshDrawSelection),
  option('elements', (elements: ElementsDefinition) =>
    elementsFacet.of(elements),
  ),
];

export default plugins;
