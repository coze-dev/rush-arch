// Extracted from https://github.com/microsoft/node-jsonc-parser/blob/3c9b4203d663061d87d4d34dd0004690aef94db5/src/main.ts#L362-L380

import { type ASTNode } from './types';

function contains(
  node: ASTNode,
  offset: number,
  includeRightBound = false,
): boolean {
  return (
    (offset >= node.offset && offset < node.offset + node.length) ||
    (includeRightBound && offset === node.offset + node.length)
  );
}

/**
 * Finds the most inner node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
 */
export function findNodeAtOffset(
  node: ASTNode,
  offset: number,
  includeRightBound = false,
): ASTNode | undefined {
  if (contains(node, offset, includeRightBound)) {
    const { children } = node;
    if (Array.isArray(children)) {
      for (
        let i = 0;
        i < children.length && children[i].offset <= offset;
        i++
      ) {
        const item = findNodeAtOffset(children[i], offset, includeRightBound);
        if (item) {
          return item;
        }
      }
    }
    return node;
  }
  return undefined;
}
