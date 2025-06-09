//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { unifiedMergeView } from '@codemirror/merge';

export interface DiffViewPropsType {
  original?: string;
}

export const diffView = (props: DiffViewPropsType) => {
  const { original = '' } = props;

  return [
    unifiedMergeView({
      original,
      gutter: false,
    }),
    EditorState.phrases.of({
      Accept: '^Y',
      Reject: '^N',
    }),
    EditorView.theme({
      '.cm-deletedChunk': {
        paddingLeft: '2px',
        backgroundColor: 'rgba(220, 68, 50, 0.2)',
      },
      '.cm-deletedChunk .cm-chunkButtons': {
        position: 'static',
        display: 'flex',
      },
      '.cm-deletedChunk .cm-chunkButtons button': {
        flex: '1',
        margin: '0px',
      },
      '.cm-deletedChunk .cm-chunkButtons button:first-child': {
        marginRight: '2px',
      },
      '.cm-deletedChunk del': {
        textDecoration: 'none',
        backgroundColor: 'rgba(220, 68, 50, 0.4)',
      },
      '&.cm-merge-b .cm-changedLine': {
        backgroundColor: 'rgba(33, 170, 33, 0.2)',
      },
      '.cm-insertedLine .cm-changedText': {
        background: 'none',
        backgroundColor: 'rgba(33, 170, 33, 0.4)',
      },
    }),
  ];
};
