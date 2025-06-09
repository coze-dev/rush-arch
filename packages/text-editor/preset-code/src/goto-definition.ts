//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { FacetCombineStrategy } from '@coze-editor/utils';
import { type EditorView, ViewPlugin } from '@codemirror/view';
import { type Extension, Facet } from '@codemirror/state';

type GotoDefinitionHandler = (e: { view: EditorView; pos: number }) => void;

const handlerFacet = Facet.define({
  combine: FacetCombineStrategy.Last<GotoDefinitionHandler>,
});

const view = ViewPlugin.fromClass(
  class {
    private dispose: (() => void) | undefined;

    constructor(view: EditorView) {
      function trigger(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!e.metaKey || !target.closest('.cm-content')) {
          return;
        }

        const pos = view.posAtCoords({
          x: e.clientX,
          y: e.clientY,
        });

        if (typeof pos !== 'number') {
          return;
        }

        const handler = view.state.facet(handlerFacet);
        handler({
          view,
          pos,
        });
      }

      document.addEventListener('click', trigger, false);

      this.dispose = () => {
        document.removeEventListener('click', trigger, false);
      };
    }

    destroy() {
      if (typeof this.dispose === 'function') {
        this.dispose();
      }
    }
  },
);

export default function gotoDefinition(
  handler: GotoDefinitionHandler,
): Extension[] {
  return [handlerFacet.of(handler), view];
}
