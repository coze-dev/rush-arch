//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';

import { type BuiltinEditorAPI, useEditor } from '@coze-editor/react';

function useMouseSelectionPopup() {
  const editor = useEditor<BuiltinEditorAPI>();
  const [visible, setVisible] = useState(false);
  const [selection, setSelection] = useState<{
    from: number;
    to: number;
    anchor: number;
    head: number;
  } | null>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }

    function handleMousedown() {
      setVisible(false);
    }

    function handleMouseup() {
      // mouseup 触发时机过早，此时 getSelection 获取到的信息还是上一次的 selection
      setTimeout(() => {
        const cmSelection = editor.$view.state.selection.main;

        if (!cmSelection) {
          setVisible(false);
          return;
        }

        const isRange = cmSelection.from !== cmSelection.to;

        if (!isRange) {
          setVisible(false);
          return;
        }

        setSelection({
          from: cmSelection.from,
          to: cmSelection.to,
          anchor: cmSelection.anchor,
          head: cmSelection.head,
        });

        // make showing up smooth
        setTimeout(() => {
          setVisible(true);
        }, 50);
      }, 50);
    }

    // 发生内容变更时，隐藏 popover
    function handleSelectionChange() {
      setVisible(false);
    }

    // 失焦时，隐藏 popover
    function handleBlur() {
      setVisible(false);
    }

    editor.$on('mousedown', handleMousedown);
    editor.$on('mouseup', handleMouseup);
    editor.$on('selectionChange', handleSelectionChange);
    editor.$on('blur', handleBlur);

    return () => {
      editor.$off('mousedown', handleMousedown);
      editor.$off('mouseup', handleMouseup);
      editor.$off('selectionChange', handleSelectionChange);
      editor.$off('blur', handleBlur);
    };
  }, [editor]);

  const anchor = selection?.anchor ?? -1;
  const head = selection?.head ?? -1;
  const from = selection?.from ?? -1;
  const to = selection?.to ?? -1;

  return {
    anchor,
    head,
    from,
    to,
    visible,
  };
}

export { useMouseSelectionPopup };
