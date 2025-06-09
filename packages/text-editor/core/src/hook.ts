//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

class SyncHook<T = unknown> {
  #fns: [string, T][] = [];

  tap(id: string, hookFn: T): void {
    this.#fns.push([id, hookFn]);
  }

  call(...args: unknown[]): void {
    const fns = this.#fns;

    fns.forEach(item => {
      const fn = item[1];
      if (typeof fn === 'function') {
        fn(...args);
      }
    });
  }
}

function createSyncHook<T = unknown>(): SyncHook<T> {
  return new SyncHook<T>();
}

export { createSyncHook };

export type { SyncHook };
