import { useEffect } from 'react';

import { type BuiltinEditorAPI, useEditor } from '@coze-editor/react';

function ValueSync({ value }: { value: string }) {
  const editor = useEditor<BuiltinEditorAPI | null>();

  useEffect(() => {
    if (!editor) {
      return;
    }

    const { doc } = editor.$view.state;
    if (typeof value === 'string' && value !== doc.toString()) {
      editor.$view.dispatch({
        changes: {
          from: 0,
          to: doc.length,
          insert: value,
        },
      });
    }
  }, [editor, value]);

  return null;
}

export { ValueSync };
