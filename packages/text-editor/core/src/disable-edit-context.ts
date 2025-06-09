//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { EditorView } from '@codemirror/view';

function disableEditContext() {
  (EditorView as any).EDIT_CONTEXT = false;
}

export { disableEditContext };
