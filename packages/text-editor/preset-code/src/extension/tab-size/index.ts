//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { EditorState } from '@codemirror/state';
import { indentUnit } from '@codemirror/language';
export const tabSize = (size = 2) => [
  EditorState.tabSize.of(size),
  indentUnit.of(' '.repeat(size)),
];
