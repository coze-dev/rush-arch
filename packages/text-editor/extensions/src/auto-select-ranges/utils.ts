//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

interface Range {
  from: number;
  to: number;
}

function mergeIntervals(ranges: Range[]) {
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

function findContainingRange(ranges: Range[], pos: number): Range | undefined {
  for (const range of ranges) {
    if (pos >= range.from && pos <= range.to) {
      return range;
    }
  }
}

export { mergeIntervals, findContainingRange };
