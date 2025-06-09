//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type EditorState } from '@codemirror/state';

import type { BackgroundDecoration } from './types';

// 将跨行的 decoration 在换行符的位置再次切割
function cutAtLineBreak(
  decorations: BackgroundDecoration[],
  state: EditorState,
) {
  const cuts: BackgroundDecoration[] = [];

  decorations.forEach(deco => {
    const startLine = state.doc.lineAt(deco.from);
    const endLine = state.doc.lineAt(deco.to);
    if (startLine.number !== endLine.number) {
      const slices: BackgroundDecoration[] = [];
      let pos = deco.from;

      for (let i = startLine.number; i < endLine.number; i++) {
        const line = state.doc.line(i);

        slices.push({
          from: pos,
          to: line.to,
          className: deco.className,
        });

        pos = line.to + 1;
      }

      slices.push({
        from: pos,
        to: deco.to,
        className: deco.className,
      });

      cuts.push(...slices);
    } else {
      cuts.push(deco);
    }
  });

  return cuts;
}

export { cutAtLineBreak };
