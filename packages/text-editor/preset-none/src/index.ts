import {
  type EditorPluginSpec,
  type InferEditorAPIFromPlugins,
} from '@text-editor/core';

const preset = [] as EditorPluginSpec<string, any, any>[];
type EditorAPI = InferEditorAPIFromPlugins<typeof preset>;

export default preset;
export type { EditorAPI };
