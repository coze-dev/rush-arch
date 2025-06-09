//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { flatten, hasOverlap } from '@coze-editor/utils';
import { EditorSelection, EditorState, Facet } from '@codemirror/state';

interface SelectionEnlargerSpec {
  source: {
    from: number;
    to: number;
  };
  target: {
    from: number;
    to: number;
  };
}

type SelectionEnlargerProvider = (
  state: EditorState,
) => SelectionEnlargerSpec[];

const extension = EditorState.transactionFilter.of(tr => {
  // 内容变化或者选区不变，跳过
  if (tr.docChanged || tr.newSelection.eq(tr.startState.selection)) {
    return tr;
  }

  const providers = tr.startState.facet(selectionEnlarger);
  const specs = flatten(providers.map(provider => provider(tr.startState)));

  let { newSelection } = tr;

  newSelection.ranges.forEach((range, index) => {
    for (const spec of specs) {
      if (hasOverlap(range, spec.source)) {
        const isReversed = range.head < range.anchor;
        const from = Math.min(range.from, spec.target.from);
        const to = Math.max(range.to, spec.target.to);
        const newRange = isReversed
          ? EditorSelection.range(
              to,
              from,
              range.goalColumn,
              range.bidiLevel ?? undefined,
            )
          : EditorSelection.range(
              from,
              to,
              range.goalColumn,
              range.bidiLevel ?? undefined,
            );

        newSelection = newSelection.replaceRange(newRange, index);
      }
    }
  });

  return [
    tr,
    {
      selection: newSelection,
    },
  ];
});

const selectionEnlarger = Facet.define<SelectionEnlargerProvider>({
  enables: extension,
});

export { selectionEnlarger };

export type { SelectionEnlargerSpec };
