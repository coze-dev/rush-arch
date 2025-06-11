//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { pick } from 'es-toolkit';
import { RectangleMarker, keymap, type EditorView } from '@codemirror/view';
import {
  EditorSelection,
  type Line,
  Prec,
  StateEffect,
  StateField,
} from '@codemirror/state';
import { undo as cmUndo, redo as cmRedo } from '@codemirror/commands';

interface Context {
  view: EditorView;
}

export const getValue =
  ({ view }: Context) =>
  () =>
    view.state.sliceDoc();

export const setValue =
  ({ view }: Context) =>
  (value: string) => {
    const { state } = view;
    if (state.readOnly) {
      return;
    }
    view.dispatch(
      state.update({
        changes: {
          from: 0,
          to: state.doc.length,
          insert: value ?? '',
        },
      }),
    );
  };

export const focus =
  ({ view }: Context) =>
  () => {
    view.focus();
  };

export const blur =
  ({ view }: Context) =>
  () => {
    view.contentDOM.blur();
  };

export const setCursorPosition =
  ({ view }: Context) =>
  (pos: number): void => {
    view.dispatch({
      selection: {
        head: pos,
        anchor: pos,
      },
    });
  };

export const getCursorPosition =
  ({ view }: Context) =>
  (): number =>
    view.state.selection.main.head;

// Make sure the given regexp has a $ at its end and, if `start` is
// true, a ^ at its start.
function ensureAnchor(expr: RegExp, start: boolean) {
  const { source } = expr;
  const addStart = start && source[0] !== '^',
    addEnd = source[source.length - 1] !== '$';
  if (!addStart && !addEnd) {
    return expr;
  }
  return new RegExp(
    `${addStart ? '^' : ''}(?:${source})${addEnd ? '$' : ''}`,
    expr.flags ?? (expr.ignoreCase ? 'i' : ''),
  );
}

export const matchBefore =
  ({ view }: Context) =>
  (match: RegExp): { from: number; to: number; text: string } | null => {
    const pos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(pos);
    const start = Math.max(line.from, pos - 250);
    const str = line.text.slice(start - line.from, pos - line.from);

    if (match instanceof RegExp) {
      const found = str.search(ensureAnchor(match, false));
      return found < 0
        ? null
        : { from: start + found, to: pos, text: str.slice(found) };
    }

    return null;
  };

export const getView =
  ({ view }: Context) =>
  () =>
    view;

export interface ReplaceTextByRangeOptions {
  from: number;
  to: number;
  text: string;
  cursorOffset?: number;
  userEvent?: string;
}

export const replaceTextByRange =
  ({ view }: Context) =>
  ({
    from,
    to,
    text,
    cursorOffset = 0,
    userEvent,
  }: ReplaceTextByRangeOptions) => {
    const { state } = view;

    if (state.readOnly) {
      return;
    }

    const { main } = state.selection;
    const fromOff = from - main.from;
    const toOff = to - main.from;

    view.dispatch({
      ...view.state.changeByRange(range => {
        if (
          range !== main &&
          from !== to &&
          state.sliceDoc(range.from + fromOff, range.from + toOff) !==
            state.sliceDoc(from, to)
        ) {
          return { range };
        }
        return {
          changes: {
            from: range.from + fromOff,
            to: to === main.from ? range.to : range.from + toOff,
            insert: text,
          },
          range: EditorSelection.cursor(
            range.from + fromOff + text.length + cursorOffset,
          ),
        };
      }),
      scrollIntoView: true,
      userEvent,
    });
  };

const updateDisabledKeybindings = StateEffect.define<string[]>();

const stub = () => true;

export const disableKeybindingsField = StateField.define<string[]>({
  create() {
    return [];
  },
  update(keys, tr) {
    for (const effect of tr.effects) {
      if (effect.is(updateDisabledKeybindings)) {
        return effect.value;
      }
    }
    return keys;
  },
  provide(f) {
    return Prec.highest(
      keymap.compute([f], state => {
        const keys = state.field(f);
        return keys.map(key => ({
          key,
          run: stub,
        }));
      }),
    );
  },
});

export const disableKeybindings =
  ({ view }: Context) =>
  (keys: string[]) => {
    view.dispatch({
      effects: updateDisabledKeybindings.of(keys),
    });
  };

export const getSelection =
  ({ view }: Context) =>
  () => {
    const { from, to, anchor, head } = view.state.selection.main;
    return { from, to, anchor, head };
  };

export const getLineInfoAtPosition =
  ({ view }: Context) =>
  (pos: number): Line =>
    view.state.doc.lineAt(pos);

export const isFocused =
  ({ view }: Context) =>
  () =>
    view.hasFocus;

export const getMainSelectionRects =
  ({ view }: Context) =>
  () => {
    const markers = RectangleMarker.forRange(
      view,
      '',
      view.state.selection.main,
    );
    return markers.map(marker =>
      pick(marker, ['top', 'left', 'width', 'height']),
    );
  };

// export const getInterpolationText = ({ view }: Context) => {
//   return (pos: number) => {

//   }
// }

// export const isInInterpolation = ({ view }: Context) => {
//   return (pos: number) => {

//   }
// }

// export const getInterpolationRange = ({ view }: Context) => {
//   return (pos: number) => {

//   }
// }

interface InsertTextContext extends Context {
  text?: string;
  range?: {
    from: number;
    to?: number;
  };
  scrollIntoView?: boolean;
}

const isNumber = (value: unknown): value is number => typeof value === 'number';

export const insertText = ({
  view,
  text = '',
  range = { from: 0 },
  scrollIntoView = true,
}: InsertTextContext) => {
  try {
    view.dispatch({
      changes: {
        from: range.from,
        insert: text,
        ...(isNumber(range.to)
          ? {
              to: range.to,
            }
          : {}),
      },
      selection: { anchor: range.from, head: range.from + text.length },
      scrollIntoView,
    });
  } catch (e) {
    console.error('insertText failed', e);
  }
};

type ReplaceTextOptions = {
  from: number;
  to: number;
  text: string;
  cursorOffset?: number;
  scrollIntoView?: boolean;
  userEvent?: string;
};
export const replaceText =
  ({ view }: Context) =>
  (options: ReplaceTextOptions) => {
    const { state } = view;

    if (state.readOnly) {
      return;
    }

    const {
      from,
      to,
      text,
      cursorOffset = 0,
      scrollIntoView = true,
      userEvent,
    } = options;

    view.dispatch({
      changes: {
        from,
        to,
        insert: text,
      },
      selection: EditorSelection.cursor(from + text.length + cursorOffset),
      scrollIntoView,
      userEvent,
    });
  };

export const undo =
  ({ view }: Context) =>
  () => {
    cmUndo({
      state: view.state,
      dispatch: view.dispatch,
    });
  };

export const redo =
  ({ view }: Context) =>
  () => {
    cmRedo({
      state: view.state,
      dispatch: view.dispatch,
    });
  };

type TextTransformer = (text: string) => string | undefined;
export const transformTextInSelection =
  ({ view }: Context) =>
  (transformer: TextTransformer) => {
    const { from, to } = view.state.selection.main;
    const text = view.state.sliceDoc(from, to);

    const newText = transformer(text);

    if (typeof newText !== 'string') {
      return;
    }

    view.dispatch({
      changes: {
        from,
        to,
        insert: newText,
      },
      selection: EditorSelection.cursor(from + newText.length),
    });
  };
