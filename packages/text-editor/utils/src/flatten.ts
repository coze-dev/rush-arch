function flatten<T>(arrayOfArray: T[][]) {
  return arrayOfArray.reduce((memo, current) => [...memo, ...current], []);
}

export { flatten };
