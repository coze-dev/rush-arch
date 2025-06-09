//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  type EditorPluginSpec,
  type InferEditorAPIFromPlugins,
} from '@coze-editor/core';

const preset = [] as EditorPluginSpec<string, any, any>[];
type EditorAPI = InferEditorAPIFromPlugins<typeof preset>;

export default preset;
export type { EditorAPI };
