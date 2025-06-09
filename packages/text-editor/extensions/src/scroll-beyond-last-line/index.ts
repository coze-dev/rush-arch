//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { EditorView, layer, type ViewUpdate } from '@codemirror/view';

import { EmptyBlock } from './empty-block';

export const scrollBeyondLastLine = (scrollHeight?: number) => [
  layer({
    above: false,
    updateOnDocViewUpdate: true,
    class: 'cm-empty-marker-layer',
    update(update: ViewUpdate): boolean {
      return update.state.doc.lines !== update.startState.doc.lines;
    },
    markers(view) {
      const maker = new EmptyBlock(
        view.state.doc.lines,
        view.contentHeight,
        scrollHeight,
      );
      return [maker];
    },
  }),
  EditorView.theme({
    '& .cm-empty-marker-layer': {
      height: '100%',
    },
  }),
];
