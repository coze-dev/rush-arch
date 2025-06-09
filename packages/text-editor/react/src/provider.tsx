//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import React, {
  type Dispatch,
  type ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react';

import { type Injector, createInjector } from '@coze-editor/core';

const InternalEditorContext = createContext<unknown>(null);
const InternalSetEditorContext = createContext<Dispatch<any> | null>(null);
const InjectorContext = createContext<Injector | undefined>(undefined);

function useEditor<T>(): T {
  return useContext(InternalEditorContext) as T;
}

function useSetEditor(): Dispatch<any> | null {
  return useContext(InternalSetEditorContext);
}

function useInjector(): Injector {
  const injector = useContext(InjectorContext);

  if (!injector) {
    throw new Error('useInjector should be used in EditorProvider');
  }

  return injector;
}

function EditorProvider({ children }: { children?: ReactNode }) {
  const [editor, setEditor] = useState(null);
  const injectorRef = useRef<Injector | null>(null);

  if (!injectorRef.current) {
    injectorRef.current = createInjector();
  }

  return (
    <InternalEditorContext.Provider value={editor}>
      <InternalSetEditorContext.Provider value={setEditor}>
        <InjectorContext.Provider value={injectorRef.current}>
          {children}
        </InjectorContext.Provider>
      </InternalSetEditorContext.Provider>
    </InternalEditorContext.Provider>
  );
}

export { EditorProvider, useEditor, useSetEditor, useInjector };
