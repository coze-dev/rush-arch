import { EVENT_SILENT } from '@text-editor/core';
import { type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { StateEffect } from '@codemirror/state';

export const eventChange = (update: ViewUpdate) => {
  if (update.docChanged) {
    return {
      value: update.state.sliceDoc(),
    };
  }

  return EVENT_SILENT;
};

const focusStateEffect = StateEffect.define<boolean>();
export const focusChangeNotifier = ViewPlugin.fromClass(
  class {
    public hasFocus: boolean;

    constructor(view: EditorView) {
      this.hasFocus = view.hasFocus;
    }
    update(update: ViewUpdate) {
      if (update.view.hasFocus !== this.hasFocus) {
        this.hasFocus = update.view.hasFocus;

        queueMicrotask(() => {
          update.view.dispatch({
            effects: focusStateEffect.of(this.hasFocus),
          });
        });
      }
    }
  },
);

export const eventFocus = (update: ViewUpdate) => {
  for (const tr of update.transactions) {
    for (const effect of tr.effects) {
      if (effect.is(focusStateEffect) && effect.value === true) {
        return;
      }
    }
  }

  return EVENT_SILENT;
};

export const eventBlur = (update: ViewUpdate) => {
  for (const tr of update.transactions) {
    for (const effect of tr.effects) {
      if (effect.is(focusStateEffect) && effect.value === false) {
        return;
      }
    }
  }

  return EVENT_SILENT;
};

export const eventSelectionChange = (update: ViewUpdate) => {
  if (!update.startState.selection.eq(update.state.selection)) {
    const { from, to, anchor, head } = update.state.selection.main;
    return {
      selection: { from, to, head, anchor },
      update,
    };
  }

  return EVENT_SILENT;
};

export const eventViewUpdate = (update: ViewUpdate) => update;
