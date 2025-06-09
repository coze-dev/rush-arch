//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { FacetCombineStrategy, flatten } from '@coze-editor/utils';
import { ViewPlugin, type EditorView, type ViewUpdate } from '@codemirror/view';
import { EditorSelection, type EditorState, Facet } from '@codemirror/state';

import { mergeIntervals, findContainingRange } from './utils';

interface Range {
  from: number;
  to: number;
  [key: string]: unknown;
}
type RangesProvider = (state: EditorState) => Range[];
type SelectUserEvent = 'select' | 'select.pointer';

const extension = ViewPlugin.fromClass(
  class {
    lastFocus = false;

    constructor(view: EditorView) {
      this.lastFocus = view.hasFocus;
    }

    update(update: ViewUpdate) {
      const userEvent = update.state.facet(selectUserEvent) ?? 'select';

      const hasSelectUserEvent = update.transactions.some(tr =>
        tr.isUserEvent(userEvent),
      );

      if (hasSelectUserEvent) {
        const lastHasFocus = this.lastFocus;

        const startSelection = update.startState.selection;
        const { selection } = update.state;

        const rangesProviders = update.state.facet(rangesFacet);
        const ranges = mergeIntervals(
          flatten(
            rangesProviders.map(provider => provider(update.view.state)),
          ).filter(Boolean),
        );

        const currentRange = findContainingRange(ranges, selection.main.from);

        // 1. 从当前选区外进入当前选区
        // 2. 失焦状态进入当前选区（失焦前原本就在 a range 内，聚焦时再次进入 a range 内，需要再次触发选中）
        if (
          selection.main.empty &&
          currentRange &&
          (!lastHasFocus ||
            // 上一次的选区 from 或 to 在当前选区外（“首次进入”当前选区）
            findContainingRange(ranges, startSelection.main.from) !==
              currentRange ||
            findContainingRange(ranges, startSelection.main.to) !==
              currentRange)
        ) {
          queueMicrotask(() => {
            update.view.dispatch({
              selection: selection.replaceRange(
                EditorSelection.range(currentRange.from, currentRange.to),
              ),
            });
          });
        }
      }

      if (this.lastFocus !== update.view.hasFocus) {
        this.lastFocus = update.view.hasFocus;
      }
    }
  },
);

const rangesFacet = Facet.define<RangesProvider>({
  enables: extension,
});

const selectUserEvent = Facet.define<SelectUserEvent, SelectUserEvent>({
  combine: FacetCombineStrategy.Last,
});

export { rangesFacet, selectUserEvent };
