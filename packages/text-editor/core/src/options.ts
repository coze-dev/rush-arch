import {
  Compartment,
  type Extension,
  type StateEffect,
} from '@codemirror/state';

type OptionFunction<T = unknown> = (value: T) => Extension | undefined;

class OptionHandler<Value = unknown> {
  private compartment: Compartment = new Compartment();
  public extension: Extension | undefined;
  public value: Value | undefined;

  constructor(public fn: OptionFunction) {}

  init(value: Value): Extension {
    this.value = value;
    const extension = this.fn(value);
    return this.compartment.of(extension ?? []);
  }

  set(value: Value): StateEffect<unknown> | undefined {
    if (value === this.value) {
      return;
    }

    this.value = value;
    const extension = this.fn(value);
    return this.compartment.reconfigure(extension ?? []);
  }
}

class Options {
  cachedValues = Object.create(null);
  handlers: Record<string, OptionHandler[]> = Object.create(null);

  add(name: string, handler: OptionHandler) {
    this.handlers[name] = this.handlers[name] ?? [];
    this.handlers[name].push(handler);
  }

  init(values: Record<string, unknown>): Extension[] {
    const extensions: Extension[] = [];

    Object.keys(this.handlers).map(key => {
      const value = values[key];

      this.cachedValues[key] = value;

      const hs = this.handlers[key];
      if (hs) {
        hs.forEach(h => {
          const extension = h.init(value);
          if (extension) {
            extensions.push(extension);
          }
        });
      }
    });

    return extensions;
  }

  get<T = unknown>(key: string | number | symbol): T {
    return this.cachedValues[key];
  }

  set(values: Record<string, unknown>): StateEffect<unknown>[] {
    const effects: StateEffect<unknown>[] = [];

    Object.keys(values).map(key => {
      const value = values[key];

      this.cachedValues[key] = value;

      const hs = this.handlers[key];
      if (hs) {
        hs.forEach(h => {
          const effect = h.set(value);
          if (effect) {
            effects.push(effect);
          }
        });
      }
    });

    return effects;
  }
}

export { Options, OptionHandler };

export type { OptionFunction };
