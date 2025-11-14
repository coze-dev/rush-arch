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
  option('elements', (elements: ElementsDefinition) =>
    elementsFacet.of(elements),
  ),
];

export default plugins;
