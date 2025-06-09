//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  type EditorView,
  RectangleMarker,
  type ViewUpdate,
  layer,
} from '@codemirror/view';
import { EditorSelection, Facet } from '@codemirror/state';

import type { BackgroundDecoration } from './types';
import { squash } from './squash';
import { cutAtLineBreak } from './cut';

type BackgroundDecorationFn = (view: EditorView) => BackgroundDecoration[];

function configChanged(update: ViewUpdate) {
  return (
    update.startState.facet(backgroundDecorations) !==
    update.state.facet(backgroundDecorations)
  );
}

// 使用时需置于 drawSelection 下方（影响 zIndex）
const backgroundDecoratorLayer = layer({
  above: false,
  markers(view) {
    const decorations = view.state
      .facet(backgroundDecorations)
      .reduce<
        BackgroundDecoration[]
      >((memo, current) => [...memo, ...current(view)], []);

    return cutAtLineBreak(squash(decorations), view.state)
      .map(deco =>
        RectangleMarker.forRange(
          view,
          deco.className,
          EditorSelection.range(deco.from, deco.to),
        ),
      )
      .reduce((memo, current) => [...memo, ...current], []);
  },
  update(update) {
    return (
      update.focusChanged ||
      update.docChanged ||
      update.selectionSet ||
      update.viewportChanged ||
      configChanged(update)
    );
  },
  class: 'cm-backgroundDecoratorLayer',
});

const backgroundDecorations = Facet.define<
  BackgroundDecorationFn,
  BackgroundDecorationFn[]
>({
  enables: [backgroundDecoratorLayer],
});

export { backgroundDecoratorLayer, backgroundDecorations };

export type { BackgroundDecoration };
