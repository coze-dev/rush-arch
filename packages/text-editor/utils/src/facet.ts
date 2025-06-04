const FacetCombineStrategy = {
  Flatten<T>(values: readonly T[][]): T[] {
    return values.reduce((memo, current) => [...memo, ...current], []);
  },
  First<T>(values: readonly T[]): T {
    return values[0];
  },
  Last<T>(values: readonly T[]): T {
    return values[values.length - 1];
  },
};

export { FacetCombineStrategy };
