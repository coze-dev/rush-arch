import { type Extension } from '@codemirror/state';

class Themes {
  _store: Record<string, Extension> = Object.create(null);

  register(name: string, theme: Extension) {
    this._store[name] = theme;
  }

  get(name: string) {
    return this._store[name];
  }
}

const symbol = Symbol.for('codemirror.themes');

if (!(globalThis as any)[symbol]) {
  (globalThis as any)[symbol] = new Themes();
}

const themes = (globalThis as any)[symbol];

export { themes };
