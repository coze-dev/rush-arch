import { type EditorView } from '@codemirror/view';
import { Compartment, type Extension } from '@codemirror/state';

enum InjectPosition {
  Head = 'head',
  Tail = 'tail',
}

// type Plugin = EditorPluginSpec<string, any, any>[]
// type TransactionsHandler = (trs: readonly Transaction[], view: EditorView) => void;
type Eject = () => void;
interface Injector {
  view: EditorView | null;
  provideView: (view: EditorView) => void;
  inject: (extension: Extension, position?: InjectPosition) => Eject;
  getCompartment: (position: InjectPosition) => Extension;
  // exportField: (field: StateField<any>) => ({ as: (name: string) => void });
  // getExportFieldsConfig: () => Record<string, StateField<any>>;
  // setTransactionsHandler(handler: TransactionsHandler): void;
  // getTransactionsHandler(): TransactionsHandler | null;
}

function createInjector(): Injector {
  const headCompartment = new Compartment();
  const tailCompartment = new Compartment();

  const headExtensions: Extension[] = [];
  const tailExtensions: Extension[] = [];

  // let transactionsHandlers: TransactionsHandler[] = []

  return {
    view: null,
    provideView(view: EditorView) {
      this.view = view;
    },
    inject(extension, position = InjectPosition.Tail) {
      const compartment =
        position === InjectPosition.Head ? headCompartment : tailCompartment;
      const extensions =
        position === InjectPosition.Head ? headExtensions : tailExtensions;
      extensions.push(extension);

      queueMicrotask(() => {
        if (this.view) {
          this.view.dispatch({
            effects: compartment.reconfigure(extensions),
          });
        }
      });

      // eject
      return () => {
        const index = extensions.indexOf(extension);
        if (~index) {
          extensions.splice(index, 1);
        }

        queueMicrotask(() => {
          if (this.view) {
            this.view.dispatch({
              effects: compartment.reconfigure(extensions),
            });
          }
        });
      };
    },

    // @internal
    getCompartment(position: InjectPosition) {
      return position === InjectPosition.Head
        ? headCompartment.of(headExtensions)
        : tailCompartment.of(tailExtensions);
    },

    // setTransactionsHandler(handler) {
    //   if (typeof handler === 'function') {
    //     transactionsHandlers.push(handler)
    //   }

    //   return () => {
    //     const index = transactionsHandlers.indexOf(handler)
    //     if (~index) {
    //       transactionsHandlers.splice(index, 1)
    //     }
    //   }
    // },

    // getTransactionsHandler() {
    //   return transactionsHandlers[transactionsHandlers.length - 1]
    // },

    // for fields export
    // exportField(field) {
    //   return {
    //     as(name: string) {
    //       toJSONConfig[name] = field;
    //     }
    //   }
    // },
    // getExportFieldsConfig() {
    //   return toJSONConfig;
    // },
  };
}

export { createInjector, InjectPosition };

export type { Injector };
