//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useEffect, useRef, useState } from 'react';

import { type BuiltinEditorAPI, useEditor } from '@coze-editor/react';
import {
  type EditorState,
  StateEffect,
  StateField,
  type Transaction,
} from '@codemirror/state';

function useStateField<T = unknown>(
  create: (state: EditorState) => T,
  update?: (value: T, tr: Transaction) => T,
) {
  const editor = useEditor<BuiltinEditorAPI>();

  const [effect] = useState(() => StateEffect.define<T>());

  const updateRef = useRef<((value: T, tr: Transaction) => T) | undefined>();
  updateRef.current = update;

  const [field] = useState<StateField<T>>(() =>
    StateField.define({
      create(state) {
        return create(state);
      },
      update(value, tr) {
        if (typeof updateRef.current === 'function') {
          value = updateRef.current(value, tr);
        }

        for (const trEffect of tr.effects) {
          if (trEffect.is(effect)) {
            return trEffect.value;
          }
        }

        return value;
      },
    }),
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.$view.dispatch({
      effects: effect.of(create(editor.$view.state)),
    });
  }, [editor, effect, create]);

  return field;
}

export { useStateField };
