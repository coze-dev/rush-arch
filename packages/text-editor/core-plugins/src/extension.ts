//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { EditorView } from '@codemirror/view';
import { Prec } from '@codemirror/state';

export const basic = () => [
  Prec.low(
    EditorView.theme({
      '&.cm-focused': { outline: 'none' },
      '& .cm-content': { cursor: 'text' },
      '& .cm-placeholder': {
        // position: 'absolute',
        wordBreak: 'break-all',
      },
    }),
  ),
];
