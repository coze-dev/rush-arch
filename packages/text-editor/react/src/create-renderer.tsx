import React, { useMemo } from 'react';

import { type EditorPluginSpec } from '@text-editor/core';
import { type Extension } from '@codemirror/state';

import { Renderer, type InferRendererProps } from './renderer';

const OriginRenderer: (props: any) => JSX.Element = Renderer;

function createRenderer<T extends EditorPluginSpec<string, any, any>[]>(
  plugins: T,
  builtinExtensions?: Extension[],
) {
  return function CustomRenderer(props: InferRendererProps<T>) {
    const userExtensions = props.extensions;

    const extensions: Extension[] = useMemo(
      () => [...(builtinExtensions ?? []), ...(userExtensions ?? [])],
      [userExtensions],
    );

    return (
      <OriginRenderer {...props} extensions={extensions} plugins={plugins} />
    );
  };
}

export { createRenderer };
