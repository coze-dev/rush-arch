//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useLayoutEffect, useRef, useState } from 'react';

import { useInjector, InjectPosition } from '@coze-editor/react';
import { EditorView } from '@codemirror/view';

function useFocused() {
  const injector = useInjector();
  const [focused, setFocused] = useState(false);

  const focusedRef = useRef(focused);

  useLayoutEffect(
    () =>
      injector.inject(
        [
          EditorView.updateListener.of(update => {
            if (focusedRef.current !== update.view.hasFocus) {
              setFocused(update.view.hasFocus);
              focusedRef.current = update.view.hasFocus;
            }
          }),
        ],
        InjectPosition.Tail,
      ),
    [injector, setFocused],
  );

  return focused;
}

export { useFocused };
