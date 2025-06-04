interface RangeLike {
  from: number;
  to: number;
  [key: string]: unknown;
}

function mergeIntervals(ranges: RangeLike[]) {
  if (ranges.length === 0) {
    return [];
  }

  const merged: { from: number; to: number }[] = [];
  const cloned = ranges.map(range => ({
    from: range.from,
    to: range.to,
  }));

  cloned.sort((a, b) => a.from - b.from);

  let current = cloned[0];
  for (let i = 1; i < cloned.length; i++) {
    const next = cloned[i];

    if (next.from <= current.to) {
      current.to = Math.max(current.to, next.to);
    } else {
      merged.push(current);
      current = next;
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged;
}

function findContainingRange(
  ranges: RangeLike[],
  pos: number,
): RangeLike | undefined {
  for (const range of ranges) {
    if (pos >= range.from && pos <= range.to) {
      return range;
    }
  }
}

export { mergeIntervals, findContainingRange };
