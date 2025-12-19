import { type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { Compartment, Facet, type Extension } from '@codemirror/state';

import {
  extension,
  type ExtensionPluginSpec,
  option,
  type OptionPluginSpec,
} from './spec';

function last<T>(values: readonly T[]): T {
  return values[values.length - 1];
}

function asyncOption<Name extends string, Value>(
  name: Name,
  handler: (value: Value) => Promise<Extension>,
  options?: { reset?: boolean },
): [ExtensionPluginSpec, OptionPluginSpec<Name, Value>] {
  const facet = Facet.define<Value, Value>({
    combine: last,
  });

  const compartment = new Compartment();

  const plugin = ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        this.apply(view);
      }

      update(update: ViewUpdate) {
        if (update.state.facet(facet) !== update.startState.facet(facet)) {
          this.apply(update.view);
        }
      }

      apply(view: EditorView) {
        const value = view.state.facet(facet);
        if (options?.reset === true) {
          queueMicrotask(() => {
            view.dispatch({
              effects: compartment.reconfigure([]),
            });
          });
        }

        handler(value).then(ext => {
          if (view.state.facet(facet) === value) {
            queueMicrotask(() => {
              view.dispatch({
                effects: compartment.reconfigure(ext),
              });
            });
          }
        });
      }
    },
  );

  return [
    extension([plugin, compartment.of([])]),
    option(name, (value: Value) => facet.of(value)),
  ] as const;
}

export { asyncOption };
