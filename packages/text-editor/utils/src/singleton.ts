function singleton<T>(id: string, instance: T): T {
  const symbol = Symbol.for(id);

  if (!(globalThis as any)[symbol]) {
    (globalThis as any)[symbol] = instance;
  }

  return (globalThis as any)[symbol];
}

export { singleton };
