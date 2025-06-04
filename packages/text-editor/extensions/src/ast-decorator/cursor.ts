import type { TreeCursor } from '@lezer/common';
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  type PluginValue,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { type EditorState, Facet, RangeSetBuilder } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

import {
  type BackgroundDecoration,
  backgroundDecorations,
} from '../background-decorations';

type CursorASTDecorator = (
  cursor: TreeCursor,
  state: EditorState,
) => ClassNameDecorationSpec | BackgroundDecorationSpec | undefined;

interface BaseDecorationSpec {
  from?: number;
  to?: number;
}

interface ClassNameDecorationSpec extends BaseDecorationSpec {
  type: 'className';
  className: string;
}

interface BackgroundDecorationSpec {
  from?: number;
  to?: number;
  type: 'background';
  className: string;
}

class CursorASTView implements PluginValue {
  private classNameDecorationCache: Map<string, Decoration> = new Map();

  decorations: DecorationSet = Decoration.none;
  backgroundDecorations: BackgroundDecoration[] = [];

  constructor(private view: EditorView) {}

  getClassDecoration(className: string) {
    if (!this.classNameDecorationCache.has(className)) {
      this.classNameDecorationCache.set(
        className,
        Decoration.mark({
          class: className,
        }),
      );
    }

    return this.classNameDecorationCache.get(className);
  }

  update(update: ViewUpdate) {
    // focus or selection changed
    if (
      (update.focusChanged && update.view.hasFocus) ||
      !update.startState.selection.eq(update.state.selection)
    ) {
      const tree = syntaxTree(update.state);
      const pos = update.state.selection.main.head;
      const decorators = update.state.facet(cursorASTDecoratorFacet);

      const cursor = tree.cursorAt(pos, 0);
      const builder = new RangeSetBuilder<Decoration>();
      const bgDecorations: BackgroundDecoration[] = [];

      do {
        decorators.forEach(decorator => {
          const decorationSpec = decorator(cursor, update.state);
          if (!decorationSpec) {
            return;
          }

          let decoration;
          switch (decorationSpec.type) {
            case 'className':
              decoration = this.getClassDecoration(decorationSpec.className);
              break;
            case 'background':
              bgDecorations.push({
                from: decorationSpec.from ?? cursor.from,
                to: decorationSpec.to ?? cursor.to,
                className: decorationSpec.className,
              });
              break;
          }

          if (decoration) {
            builder.add(
              decorationSpec.from ?? cursor.from,
              decorationSpec.to ?? cursor.to,
              decoration,
            );
          }
        });
      } while (cursor.parent());

      this.decorations = builder.finish();
      this.backgroundDecorations = bgDecorations;
    }

    if (update.focusChanged && !update.view.hasFocus) {
      this.decorations = Decoration.none;
      this.backgroundDecorations = [];
    }
  }
}

const cursorASTDecoratorFacet = Facet.define<
  CursorASTDecorator,
  CursorASTDecorator[]
>({
  enables: [
    ViewPlugin.fromClass(CursorASTView, {
      decorations: v => v.decorations,
      provide(plugin) {
        return [
          backgroundDecorations.of(
            view => view.plugin(plugin)?.backgroundDecorations ?? [],
          ),
        ];
      },
    }),
  ],
});

export { cursorASTDecoratorFacet };

export type { CursorASTDecorator };
