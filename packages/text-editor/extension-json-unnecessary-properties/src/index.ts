import { FacetCombineStrategy } from '@text-editor/utils';
import astField from '@text-editor/extension-json-ast';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { type EditorState, Facet, Prec } from '@codemirror/state';

import { type JSONPropertyChecker } from './types';
import { findUnnecessaryProperties } from './find';

const facet = Facet.define({
  combine: FacetCombineStrategy.Last<{
    isUnnecessary: JSONPropertyChecker;
  }>,
});

const plugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet = Decoration.none;

    constructor(view: EditorView) {
      this.decorations = this._getDecorations(view.state);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = this._getDecorations(update.state);
      }
    }

    _getDecorations(state: EditorState) {
      const ast = state.field(astField);

      if (!ast) {
        return Decoration.none;
      }

      const propertyRanges = findUnnecessaryProperties(
        ast,
        state.facet(facet).isUnnecessary ?? (() => false),
      );

      return Decoration.set(
        propertyRanges.map(range =>
          Decoration.mark({
            class: 'json-unnecessary-property',
          }).range(range.from, range.to),
        ),
        true,
      );
    }
  },
  {
    provide(plugin) {
      return EditorView.decorations.of(
        view => view.plugin(plugin)?.decorations ?? Decoration.none,
      );
    },
  },
);

const jsonUnnecessaryProperties = (isUnnecessary: JSONPropertyChecker) => [
  astField,
  facet.of({
    isUnnecessary,
  }),
  plugin,
  Prec.low(
    EditorView.theme({
      '.json-unnecessary-property': {
        opacity: '0.5',
      },
    }),
  ),
];

export default jsonUnnecessaryProperties;
