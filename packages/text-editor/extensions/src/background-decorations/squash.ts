//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type { BackgroundDecoration } from './types';

function squash(decorations: BackgroundDecoration[]) {
  const result: BackgroundDecoration[] = [];
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

  return result;
}

function groupDecorationsByClassName(decorations: BackgroundDecoration[]) {
  const map = new Map<string, BackgroundDecoration[]>();

  decorations.forEach(deco => {
    if (!map.has(deco.className)) {
      map.set(deco.className, []);
    }

    map.get(deco.className)!.push(deco);
  });

  return map;
}

function mergeIntervals(decorations: BackgroundDecoration[]) {
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
