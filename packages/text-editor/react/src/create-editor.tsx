import { type EditorPluginSpec } from '@coze-editor/core';

import { type InferRendererProps } from './renderer';
import { EditorProvider } from './provider';
import { createRenderer, type CreateRendererOptions } from './create-renderer';

function createEditor<
  T extends EditorPluginSpec<string, any, any>[],
  U extends InferRendererProps<T> = InferRendererProps<T>,
>(plugins: T, options?: CreateRendererOptions<U['options']>) {
  const CustomRenderer = createRenderer(plugins, options);

  return function CustomEditor(props: InferRendererProps<T>) {
    return (
      <EditorProvider>
        <CustomRenderer {...props} />
      </EditorProvider>
    );
  };
}

export { createEditor };
