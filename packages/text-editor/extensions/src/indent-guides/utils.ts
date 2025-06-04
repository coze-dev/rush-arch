const SPACES = /^\s*/;

export const getCodeStart = (text: string) => text.match(SPACES)![0].length;

export const fromPairs = (pairs: [string, unknown][]) => {
  let index = -1;
  const length = pairs == null ? 0 : pairs.length;
  const result: Record<string, unknown> = {};

  while (++index < length) {
    const pair = pairs[index];
    result[pair[0]] = pair[1];
  }
  return result;
};
