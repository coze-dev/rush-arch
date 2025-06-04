import { NodeProp, type TreeCursor } from '@lezer/common';

// TODO: 优化对外 options
// - cursor -> tree
// - remove from, to
function traverseAST(
  cursor: TreeCursor,
  from: number,
  to: number,
  callback: (cursor: TreeCursor) => void,
  disableOverlayTraverse = false,
) {
  const { from: start, to: end } = cursor;
  if (start >= to || end <= from) {
    return;
  }

  callback(cursor);

  const mounted = cursor.tree && cursor.tree.prop(NodeProp.mounted);
  if (mounted && mounted.overlay && !disableOverlayTraverse) {
    const inner = cursor.node.enter(mounted.overlay[0].from + start, 1)!;
    const hasChild = cursor.firstChild();
    for (let i = 0, pos = start; ; i++) {
      const next = i < mounted.overlay.length ? mounted.overlay[i] : null;
      const nextPos = next ? next.from + start : end;
      const rangeFrom = Math.max(from, pos);
      const rangeTo = Math.min(to, nextPos);
      if (rangeFrom < rangeTo && hasChild) {
        while (cursor.from < rangeTo) {
          traverseAST(
            cursor,
            rangeFrom,
            rangeTo,
            callback,
            disableOverlayTraverse,
          );
          if (cursor.to >= nextPos || !cursor.nextSibling()) {
            break;
          }
        }
      }
      if (!next || nextPos > to) {
        break;
      }
      pos = next.to + start;
      if (pos > from) {
        const overlayFrom = Math.max(from, next.from + start);
        const overlayTo = Math.min(to, pos);

        // walk overlay range in top tree
        while (cursor.from < overlayTo) {
          // disable overlay traverse to avoid infinite overlay traversion
          traverseAST(
            cursor,
            Math.max(from, next.from + start),
            Math.min(to, pos),
            callback,
            true,
          );
          if (cursor.to >= overlayTo || !cursor.nextSibling()) {
            break;
          }
        }

        traverseAST(
          inner.cursor(),
          overlayFrom,
          overlayTo,
          callback,
          disableOverlayTraverse,
        );
      }
    }
    if (hasChild) {
      cursor.parent();
    }
  } else if (cursor.firstChild()) {
    do {
      if (cursor.to <= from) {
        continue;
      }
      if (cursor.from >= to) {
        break;
      }
      traverseAST(cursor, from, to, callback, disableOverlayTraverse);
    } while (cursor.nextSibling());
    cursor.parent();
  }
}

export { traverseAST };
