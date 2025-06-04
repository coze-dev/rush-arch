import { type Decoration, type EditorView } from '@codemirror/view';
import { type StateEffect } from '@codemirror/state';

import {
  findDecoration,
  effects,
  type AddDecorationSpec,
  type UpdateDecorationSpec,
} from './extension';

class Decorator {
  #currentTransaction: { effects: StateEffect<any>[] } | null = null;

  public effects = effects;

  constructor(private view: EditorView) {}

  find<T = unknown>(fn: (data: T) => boolean): Decoration | undefined {
    return findDecoration<T>(this.view.state, fn);
  }

  add(spec: AddDecorationSpec) {
    const effect = effects.add(spec);

    if (this.#currentTransaction) {
      this.#currentTransaction.effects.push(effect);
    } else {
      this.view.dispatch({
        effects: effect,
      });
    }
  }

  update(decoration: Decoration, spec: UpdateDecorationSpec) {
    const effect = effects.update(decoration, spec);

    if (this.#currentTransaction) {
      this.#currentTransaction.effects.push(effect);
    } else {
      this.view.dispatch({
        effects: effect,
      });
    }
  }

  remove(decoration: Decoration) {
    const effect = effects.remove(decoration);

    if (this.#currentTransaction) {
      this.#currentTransaction.effects.push(effect);
    } else {
      this.view.dispatch({
        effects: effect,
      });
    }
  }

  transact(fn: () => void) {
    if (!this.#currentTransaction) {
      this.#currentTransaction = {
        effects: [],
      };
    }

    fn();
    this.view.dispatch({
      effects: this.#currentTransaction.effects,
    });

    this.#currentTransaction = null;
  }
}

export { Decorator };
