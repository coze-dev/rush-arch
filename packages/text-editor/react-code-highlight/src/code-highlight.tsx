import React, { useCallback, useEffect, useRef } from 'react';

import {
  Editor,
  type InferRendererProps,
  type InferEditorAPIFromPlugins,
} from '@coze-editor/react';
import presetUniversalCode from '@coze-editor/preset-universal-code';
import presetCodeHighlight from '@coze-editor/preset-code-highlight';

const preset = [...presetUniversalCode, ...presetCodeHighlight];

type EditorAPI = InferEditorAPIFromPlugins<typeof preset>;

export interface CodeHighlightProps extends InferRendererProps<typeof preset> {
  code: string;
  path: string;
}

export const CodeHighlight: React.FC<CodeHighlightProps> = ({
  code,
  path,
  didMount,
  ...props
}) => {
  const editorRef = useRef<EditorAPI>();

  const handleMount = useCallback(
    (api: EditorAPI) => {
      editorRef.current = api;
      didMount?.(api);
    },
    [didMount],
  );

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setPath(path);
    }
  }, [path]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || typeof code === 'undefined') {
      return;
    }

    if (editor.getValue() === code) {
      return;
    }

    const view = editor.$view;
    const { state } = editor.$view;
    view.dispatch(
      state.update({
        changes: {
          from: 0,
          to: state.doc.length,
          insert: code ?? '',
        },
      }),
    );
  }, [code]);

  return (
    <Editor
      plugins={preset}
      didMount={handleMount}
      defaultValue={code}
      {...props}
    ></Editor>
  );
};
