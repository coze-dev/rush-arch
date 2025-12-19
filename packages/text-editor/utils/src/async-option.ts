import {
  extension,
  type ExtensionPluginSpec,
  option,
  type OptionPluginSpec,
} from '@coze-editor/core';
import { type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { Compartment, Facet, type Extension } from '@codemirror/state';

import { FacetCombineStrategy } from './facet';

function asyncOption<Name extends string, Value>(
  name: Name,
  handler: (value: Value) => Promise<Extension>,
): [ExtensionPluginSpec, OptionPluginSpec<Name, Value>] {
  const facet = Facet.define<Value, Value>({
    combine: FacetCombineStrategy.Last,
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
        handler(value).then(ext => {
          if (view.state.facet(facet) === value) {
            view.dispatch({
              effects: compartment.reconfigure(ext),
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
