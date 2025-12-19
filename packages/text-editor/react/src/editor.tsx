import React from 'react';

import { type EditorPluginSpec } from '@coze-editor/core';

import { type InferRendererProps, Renderer } from './renderer';
import { EditorProvider } from './provider';

function Editor<T extends EditorPluginSpec<string, any, any>[]>(
  props: { plugins: T } & InferRendererProps<T>,
) {
  return (
    <EditorProvider>
      <Renderer {...props} />
    </EditorProvider>
  );
}

export { Editor };
