//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { EditorView } from '@codemirror/view';
import { type Text } from '@codemirror/state';

import { useInjectorEffect, useLatest } from '../hooks';

type ChangeListener = (event: {
  change: [number, number, number, number, Text];
  view: EditorView;
}) => void;

function useChangeListener(listener: ChangeListener) {
  const listenerRef = useLatest(listener);

  useInjectorEffect(
    injector =>
      injector.inject([
        EditorView.updateListener.of(update => {
          if (update.docChanged && typeof listenerRef.current === 'function') {
            update.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
              listenerRef.current({
                change: [fromA, toA, fromB, toB, inserted],
                view: update.view,
              });
            });
          }
        }),
      ]),
    [],
  );
}

export { useChangeListener };
