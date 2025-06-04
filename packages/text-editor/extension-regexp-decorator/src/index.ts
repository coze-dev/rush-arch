import {
  Decoration,
  EditorView,
  keymap,
  MatchDecorator,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import {
  EditorSelection,
  type Extension,
  Prec,
  type RangeSet,
  StateEffect,
} from '@codemirror/state';

type RegexpDecoratorOptions = ConstructorParameters<typeof MatchDecorator>[0];

const updateEffect = StateEffect.define();

function regexpDecorator(options: RegexpDecoratorOptions): Extension {
  const decorator = new MatchDecorator(options);

  const plugin = ViewPlugin.fromClass(
    class {
      public decorations: RangeSet<Decoration>;

      constructor(private view: EditorView) {
        this.decorations = decorator.createDeco(view);
      }

      update(update: ViewUpdate) {
        const hasUpdateEffect = update.transactions.some(tr =>
          tr.effects.some(effect => effect.is(updateEffect)),
        );

        if (hasUpdateEffect || update.selectionSet) {
          this.decorations = decorator.createDeco(update.view);
        } else if (update.docChanged) {
          // updateDeco 只有同一行存在 变更 时才会更新
          this.decorations = decorator.updateDeco(update, this.decorations);
        }
      }
    },
    {
      provide(plugin) {
        return [
          EditorView.decorations.of(
            view => view.plugin(plugin)?.decorations ?? Decoration.none,
          ),
          EditorView.atomicRanges.of(view => {
            const p = view.plugin(plugin);
            if (!p) {
              return Decoration.none;
            }
            return p.decorations.update({
              filter(from, to, value) {
                return Boolean(value.spec.atomicRange);
              },
            });
          }),
        ];
      },
    },
  );

  function runnable(side: 'to' | 'from') {
    return function run(view: EditorView) {
      const { head, anchor } = view.state.selection.main;

      if (head !== anchor) {
        return false;
      }

      const decorations = view.plugin(plugin)?.decorations ?? Decoration.none;

      let handled = false;
      decorations.between(0, view.state.doc.length, (from, to, value) => {
        const pos = side === 'from' ? from : to;
        if (pos === head && value.spec.selectable) {
          handled = true;
          view.dispatch({
            selection:
              side === 'to'
                ? EditorSelection.range(to, from)
                : EditorSelection.range(from, to),
          });
        }
      });

      return handled;
    };
  }

  return [
    plugin,
    Prec.high(
      keymap.of([
        {
          key: 'Backspace',
          run: runnable('to'),
        },
        {
          key: 'ArrowLeft',
          run: runnable('to'),
        },
        {
          key: 'ArrowRight',
          run: runnable('from'),
        },
      ]),
    ),
  ];
}

function updateRegexpDecorations(view: EditorView) {
  view.dispatch({
    effects: updateEffect.of(null),
  });
}

export default regexpDecorator;

export { updateRegexpDecorations };
