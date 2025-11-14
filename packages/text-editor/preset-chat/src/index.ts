import universalPreset from '@coze-editor/preset-universal';
import { extension, type InferEditorAPIFromPlugins } from '@coze-editor/core';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands';

import {
  type EditorNode,
  type EditorElement,
  type EditorText,
  schemaUtils,
} from './schema';
import plugins from './plugins';
import { htmlLanguage } from './language';
import { useCurrentElement } from './hooks';

const preset = [
  ...universalPreset,
  extension([
    EditorView.theme({
      '&.cm-focused': {
        outline: 'none',
      },
    }),
    htmlLanguage,
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
  ]),
  ...plugins,
];

type EditorAPI = InferEditorAPIFromPlugins<typeof preset>;

export default preset;

export { schemaUtils, useCurrentElement };

export type { EditorAPI, EditorNode, EditorElement, EditorText };
