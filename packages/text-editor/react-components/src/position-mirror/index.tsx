//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { autoUpdate } from '@floating-ui/dom';
import { type BuiltinEditorAPI } from '@coze-editor/react';
import { useEditor, useInjector } from '@coze-editor/react';
import {
  elementAtPosition,
  positionElementLayer,
} from '@coze-editor/extensions';

interface Props {
  position: number;
  onChange?: () => void;
  onVisibleChange?: (visible: boolean) => void;
}

const PositionMirror = forwardRef<HTMLDivElement, Props>(function CursorMirror(
  { position, onChange, onVisibleChange },
  ref,
) {
  const injector = useInjector();
  const editor = useEditor<BuiltinEditorAPI>();
  const [dom] = useState(() => {
    const el = document.createElement('div');
    el.classList.add('cm-position-mirror');
    return el;
  });
  const domRef = useRef<HTMLDivElement>(dom);
  domRef.current = dom;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onVisibleChangeRef = useRef(onVisibleChange);
  onVisibleChangeRef.current = onVisibleChange;

  useImperativeHandle(ref, () => domRef.current);

  useLayoutEffect(
    () =>
      injector.inject([
        elementAtPosition.of({
          dom: domRef.current,
          pos: position,
        }),
        positionElementLayer,
      ]),
    [injector, position],
  );

  // watch for position change
  useEffect(() => {
    const floating = document.createElement('div');
    document.body.appendChild(floating);

    const dispose = autoUpdate(
      domRef.current,
      floating,
      () => {
        if (typeof onChangeRef.current === 'function') {
          onChangeRef.current();
        }
      },
      { animationFrame: true },
    );

    return () => {
      document.body.removeChild(floating);
      dispose();
    };
  }, []);

  // watch for visible change
  useEffect(() => {
    if (!editor) {
      return;
    }

    const view = editor.$view;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (typeof onVisibleChangeRef.current === 'function') {
            onVisibleChangeRef.current(entry.isIntersecting);
          }
        });
      },
      {
        root: view.scrollDOM,
        threshold: 0,
      },
    );

    observer.observe(domRef.current);

    return () => {
      observer.disconnect();
    };
  }, [editor]);

  return null;
});

export { PositionMirror };
