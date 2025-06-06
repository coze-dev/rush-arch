interface Range {
  from: number;
  to: number;
}

function hasOverlap(a: Range, b: Range) {
  if (a.from === a.to) {
    return a.from > b.from && a.from < b.to;
  }

  return (
    // exists common part or a contains b
    (a.from <= b.from && a.to > b.from) ||
    (a.to >= b.to && a.from < b.to) ||
    // a inside b
    (a.from >= b.from && a.to <= b.to)
  );
}

export { hasOverlap };
