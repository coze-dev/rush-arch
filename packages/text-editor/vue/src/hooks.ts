import { createInjector, type Injector } from '@text-editor/core';
import { inject, provide, shallowRef, type ShallowRef } from 'vue';

const EditorSymbol = Symbol();
const SetEditorSymbol = Symbol();
const InjectorSymbol = Symbol();

type SetEditor = (api: unknown) => void;

function useEditorProvider() {
  const editorRef: any = shallowRef({
    value: null,
  });

  const injectorRef = shallowRef<Injector | null>(null);

  if (!injectorRef.value) {
    injectorRef.value = createInjector();
  }

  function setEditor(value: any) {
    editorRef.value = value;
  }

  provide(EditorSymbol, editorRef);
  provide(SetEditorSymbol, setEditor);
  provide(InjectorSymbol, injectorRef.value);
}

function useEditorRef<T>(): ShallowRef<T | null> {
  const editor = inject<ShallowRef<T | null>>(EditorSymbol);
  if (!editor) {
    throw new Error('Failed to get editor ref via inject');
  }
  return editor;
}

function useSetEditor(): SetEditor {
  const setEditor = inject<SetEditor>(SetEditorSymbol);
  if (!setEditor) {
    throw new Error('Failed to get setEditor via inject');
  }
  return setEditor;
}

function useInjector(): Injector {
  const injector = inject<Injector>(InjectorSymbol);

  if (!injector) {
    throw new Error('Failed to get injector via inject');
  }

  return injector;
}

export { useEditorProvider, useEditorRef, useSetEditor, useInjector };
