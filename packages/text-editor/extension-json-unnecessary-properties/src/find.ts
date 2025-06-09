//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type { ASTNode } from '@coze-editor/extension-json-ast';

import { type JSONPropertyChecker } from './types';

interface Range {
  from: number;
  to: number;
}

function findUnnecessaryProperties(
  ast: ASTNode,
  checker: JSONPropertyChecker,
): Range[] {
  const nodes: ASTNode[] = [];

  visit(ast, node => {
    if (node.type === 'property') {
      const key = node.keyNode.value;

      if (
        checker({
          paths: [...getParentKeys(node), key],
        })
      ) {
        nodes.push(node);
      }
    }

    return true;
  });

  // remove already included ranges
  // WHY: two nested `opacity: 0.5` will become `opacity: 0.25`
  const ranges: Range[] = [];
  nodes.forEach(node => {
    const nodeRange = {
      from: node.offset,
      to: node.offset + node.length,
    };

    if (ranges.some(r => nodeRange.from >= r.from && nodeRange.to <= r.to)) {
      return;
    }

    ranges.push(nodeRange);
  });

  return ranges;
}

function getParentKeys(node: ASTNode): (string | number)[] {
  const paths: (string | number)[] = [];

  let current: ASTNode = node;
  let target: ASTNode | undefined = node.parent;

  while (target) {
    if (target.type === 'property') {
      paths.unshift(target.keyNode.value);
    } else if (target.type === 'array') {
      paths.unshift(target.items.indexOf(current));
    }

    current = target;
    target = target.parent;
  }
  return paths;
}

function visit(root: ASTNode, visitor: (node: ASTNode) => boolean) {
  const doVisit = (node: ASTNode): boolean => {
    let ctn = visitor(node);
    const { children } = node;
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length && ctn; i++) {
        ctn = doVisit(children[i]);
      }
    }
    return ctn;
  };

  doVisit(root);
}

export { findUnnecessaryProperties };
