//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { createPortal } from 'react-dom';
import { type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';

import { useHTMLElement } from '@coze-editor/react-hooks';
import {
  type BuiltinEditorAPI,
  useEditor,
  useInjector,
} from '@coze-editor/react';

import { cursorBlockWidget } from './cursor-widget';

interface PropsType {
  children?: ReactNode;
  lineNumber?: number; // 1-base
  side?: number;
}

function LineWidget({ children, lineNumber, side }: PropsType): ReactNode {
  const setWidgetLineNumberRef = useRef<any>(null);
  const injector = useInjector();
  const editor = useEditor<BuiltinEditorAPI>();

  useEffect(() => {
    if (setWidgetLineNumberRef.current && editor?.$view) {
      editor.$view?.dispatch(setWidgetLineNumberRef.current(lineNumber, side));
    }
  }, [lineNumber, side]);

  const element = useHTMLElement('span');

  useLayoutEffect(() => {
    const { extension, setWidgetLineNumber } = cursorBlockWidget({
      side,
      lineNumber,
      createDOM: () => element,
    });

    setWidgetLineNumberRef.current = setWidgetLineNumber;

    return injector.inject(extension);
  }, [injector]);

  return createPortal(children, element);
}

export { LineWidget };
