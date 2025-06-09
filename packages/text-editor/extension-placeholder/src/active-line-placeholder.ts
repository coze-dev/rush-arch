//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { FacetCombineStrategy } from '@coze-editor/utils';
import {
  Decoration,
  type EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { type EditorState, type Extension, Facet } from '@codemirror/state';

import { createPlaceholderWidgetClass } from './placeholder';

// isolate Widget class with Placeholder to avoid widget reusable compare when using Placeholder and ActiveLinePlaceholder together
const Placeholder = createPlaceholderWidgetClass();

type Content = string | HTMLElement | ((view: EditorView) => HTMLElement);
const contentFacet = Facet.define({
  combine: FacetCombineStrategy.Last<Content>,
});

const activeLinePlaceholderView = ViewPlugin.fromClass(
  class {
    public decorations = Decoration.none;

    constructor(view: EditorView) {
      if (view.hasFocus) {
        this.decorations = getPlaceholderDecoration(view.state);
      } else {
        this.decorations = Decoration.none;
      }
    }

    update(update: ViewUpdate) {
      if (!update.view.hasFocus) {
        this.decorations = Decoration.none;
        return;
      }

      // docChanged case: focusing at first empty line, and hit cmd + x(non-empty second line comes in), widget should disappear
      if (update.selectionSet || update.docChanged) {
        this.decorations = getPlaceholderDecoration(update.state);
      }
    }
  },
  {
    decorations(plugin) {
      return plugin.decorations;
    },
  },
);

function getPlaceholderDecoration(state: EditorState) {
  const pos = state.selection.main.head;

  if (state.selection.main.empty) {
    const line = state.doc.lineAt(pos);

    if (line && line.length === 0) {
      const content = state.facet(contentFacet);
      return Decoration.set([
        Decoration.widget({
          widget: new Placeholder(content),
          side: 1,
        }).range(line.from),
      ]);
    }
  }

  return Decoration.none;
}

const activeLinePlaceholder = function (content: Content): Extension {
  return [activeLinePlaceholderView, contentFacet.of(content)];
};

export { activeLinePlaceholder };
