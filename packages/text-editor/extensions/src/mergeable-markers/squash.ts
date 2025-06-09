//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

export interface MarkDecorationSpec {
  from: number;
  to: number;
  className: string;
}

function squash(decorations: MarkDecorationSpec[]) {
  const result: MarkDecorationSpec[] = [];
  const grouped = groupDecorationsByClassName(decorations);

  grouped.forEach((decos, className) => {
    const merged = mergeIntervals(decos);
    result.push(
      ...merged.map(m => ({
        from: m.start,
        to: m.end,
        className,
      })),
    );
  });

  result.sort((a, b) => a.from - b.from);

  return result;
}

function groupDecorationsByClassName(decorations: MarkDecorationSpec[]) {
  const map = new Map<string, MarkDecorationSpec[]>();

  decorations.forEach(deco => {
    if (!map.has(deco.className)) {
      map.set(deco.className, []);
    }

    map.get(deco.className)!.push(deco);
  });

  return map;
}

function mergeIntervals(decorations: MarkDecorationSpec[]) {
  const merged: { start: number; end: number }[] = [];
  const cloned = decorations.map(deco => ({
    start: deco.from,
    end: deco.to,
  }));

  cloned.sort((a, b) => a.start - b.start);

  let current = cloned[0];
  for (let i = 1; i < cloned.length; i++) {
    const next = cloned[i];

    if (next.start <= current.end) {
      current.end = Math.max(current.end, next.end);
    } else {
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);

  return merged;
}

export { squash };
