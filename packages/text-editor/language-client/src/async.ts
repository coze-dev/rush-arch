import { type Disposable } from 'vscode-languageserver-protocol/browser'

const timer = {
  setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): Disposable {
    const handle = setTimeout(callback, ms, ...args);
    return { dispose: () => clearTimeout(handle) };
  },
  setImmediate(callback: (...args: any[]) => void, ...args: any[]): Disposable {
    const handle = setTimeout(callback, 0, ...args);
    return { dispose: () => clearTimeout(handle) };
  },
}

export type ITask<T> = () => T;

export class Delayer<T> {

  public defaultDelay: number;
  private timeout: Disposable | undefined;
  private completionPromise: Promise<T> | undefined;
  private onSuccess: ((value: T | Promise<T> | undefined) => void) | undefined;
  private task: ITask<T> | undefined;

  constructor(defaultDelay: number) {
    this.defaultDelay = defaultDelay;
    this.timeout = undefined;
    this.completionPromise = undefined;
    this.onSuccess = undefined;
    this.task = undefined;
  }

  public trigger(task: ITask<T>, delay: number = this.defaultDelay): Promise<T> {
    this.task = task;
    if (delay >= 0) {
      this.cancelTimeout();
    }

    if (!this.completionPromise) {
      this.completionPromise = new Promise<T | undefined>((resolve) => {
        this.onSuccess = resolve;
      }).then(() => {
        this.completionPromise = undefined;
        this.onSuccess = undefined;
        const result = this.task!();
        this.task = undefined;
        return result;
      });
    }

    if (delay >= 0 || this.timeout === void 0) {
      this.timeout = timer.setTimeout(() => {
        this.timeout = undefined;
        this.onSuccess!(undefined);
      }, delay >= 0 ? delay : this.defaultDelay);
    }

    return this.completionPromise;
  }

  public forceDelivery(): T | undefined {
    if (!this.completionPromise) {
      return undefined;
    }
    this.cancelTimeout();
    const result: T = this.task!();
    this.completionPromise = undefined;
    this.onSuccess = undefined;
    this.task = undefined;
    return result;
  }

  public isTriggered(): boolean {
    return this.timeout !== undefined;
  }

  public cancel(): void {
    this.cancelTimeout();
    this.completionPromise = undefined;
  }

  private cancelTimeout(): void {
    if (this.timeout !== undefined) {
      this.timeout.dispose()
      this.timeout = undefined;
    }
  }
}

type Thunk<T> = () => T;

interface Waiting<T> {
  thunk: Thunk<T | PromiseLike<T>>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export class Semaphore<T = void> {

  private _capacity: number;
  private _active: number;
  private _waiting: Waiting<T>[];

  public constructor(capacity = 1) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    this._capacity = capacity;
    this._active = 0;
    this._waiting = [];
  }

  public lock(thunk: () => T | PromiseLike<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this._waiting.push({ thunk, resolve, reject });
      this.runNext();
    });
  }

  public get active(): number {
    return this._active;
  }

  private runNext(): void {
    if (this._waiting.length === 0 || this._active === this._capacity) {
      return;
    }
    timer.setImmediate(() => this.doRunNext());
  }

  private doRunNext(): void {
    if (this._waiting.length === 0 || this._active === this._capacity) {
      return;
    }
    const next = this._waiting.shift()!;
    this._active++;
    if (this._active > this._capacity) {
      throw new Error('To many thunks active');
    }
    try {
      const result = next.thunk();
      if (result instanceof Promise) {
        result.then((value) => {
          this._active--;
          next.resolve(value);
          this.runNext();
        }, (err) => {
          this._active--;
          next.reject(err);
          this.runNext();
        });
      } else {
        this._active--;
        next.resolve(result);
        this.runNext();
      }
    } catch (err) {
      this._active--;
      next.reject(err);
      this.runNext();
    }
  }
}