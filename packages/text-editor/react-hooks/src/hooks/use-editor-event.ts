//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

// WHY use-editor-event: avoid conflicts with React hook: useEvent

import { useEffect } from 'react';

interface EditorAPILike {
  __private_eventmap: Record<string, any>;
}

function useEditorEvent<
  T extends EditorAPILike,
  K extends keyof T['__private_eventmap'],
>(editor: T, eventName: K, handler: T['__private_eventmap'][K]): void {
  useEffect(() => {
    if (!editor) {
      return;
    }

    (editor as any).$on(eventName, handler);

    return () => {
      (editor as any).$off(eventName, handler);
    };
  }, [editor, eventName, handler]);
}

export { useEditorEvent };
