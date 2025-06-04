/// Basic rectangle type.
interface Rect {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

let scratchRange: Range | null;

function textRange(node: Text, from: number, to = from) {
  const range = scratchRange || (scratchRange = document.createRange());
  range.setEnd(node, to);
  range.setStart(node, from);
  return range;
}

function flattenRect(rect: Rect, left: boolean) {
  const x = left ? rect.left : rect.right;
  return { left: x, right: x, top: rect.top, bottom: rect.bottom };
}

function clientRectsFor(dom: Node) {
  if (dom.nodeType == 3) {
    return textRange(dom as Text, 0, dom.nodeValue!.length).getClientRects();
  } else if (dom.nodeType == 1) {
    return (dom as HTMLElement).getClientRects();
  } else {
    return [] as any as DOMRectList;
  }
}

export { flattenRect, clientRectsFor };

export type { Rect };
