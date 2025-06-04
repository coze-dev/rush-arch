import { EditorView, type DecorationSet } from '@codemirror/view';
import {
  StateField,
  StateEffect,
  type TransactionSpec,
  type EditorState,
} from '@codemirror/state';

import { createBlockWidget } from './widget-decoration';
import { type ConfigFacet } from './common';

const setWidgetEffect = StateEffect.define<{
  lineNumber?: number;
  side?: number;
  id: number;
}>();

const getPos = (state: EditorState, num: number) => state.doc.line(num).from;

export const cursorWidgetState = (facet: ConfigFacet) =>
  StateField.define<DecorationSet>({
    create(state) {
      return createBlockWidget(
        facet.config,
        typeof facet.config.lineNumber === 'number'
          ? getPos(state, facet.config.lineNumber)
          : undefined,
      );
    },
    update(widget, tr) {
      tr.effects.forEach(effect => {
        if (effect.is(setWidgetEffect) && effect.value.id === facet.id) {
          widget = createBlockWidget(
            {
              ...facet.config,
              side: effect.value.side,
              lineNumber: effect.value.lineNumber,
            },
            typeof effect.value.lineNumber === 'number'
              ? getPos(tr.state, effect.value.lineNumber)
              : undefined,
          );
        }
      });

      return widget.update({
        filter: (from, to) => 0 <= from && to <= tr.state.doc.length,
      });
    },
    provide: f => EditorView.decorations.from(f),
  });

export const setWidgetLineNumber = (
  id: number,
  lineNumber?: number,
  side?: number,
): TransactionSpec => ({
  effects: [setWidgetEffect.of({ lineNumber, id, side })],
});
