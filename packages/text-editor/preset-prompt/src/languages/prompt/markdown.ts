//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  parser,
  GFM,
  Subscript,
  Superscript,
  Emoji,
  parseCode,
} from '@lezer/markdown';
import { NodeProp, type NodeType, type SyntaxNode } from '@lezer/common';
import {
  Language,
  defineLanguageFacet,
  foldService,
  indentNodeProp,
  languageDataProp,
  syntaxTree,
} from '@codemirror/language';

import { htmlLanguage } from './html';

const headingProp = new NodeProp();

function isHeading(type: NodeType) {
  const match = /^(?:ATX|Setext)Heading(\d)$/.exec(type.name);
  return match ? Number(match[1]) : undefined;
}

function findSectionEnd(headerNode: SyntaxNode, level: number) {
  let last = headerNode;
  for (;;) {
    const next = last.nextSibling;
    let heading;
    if (
      !next ||
      ((heading = isHeading(next.type)) != null && heading <= level)
    ) {
      break;
    }
    last = next;
  }
  return last.to;
}

const headingFold = foldService.of((state, start, end) => {
  for (
    let node: SyntaxNode | null = syntaxTree(state).resolveInner(end, -1);
    node;
    node = node.parent
  ) {
    if (node.from < start) {
      break;
    }
    const heading = node.type.prop(headingProp) as number;
    if (heading == null) {
      continue;
    }
    const upto = findSectionEnd(node, heading);
    if (upto > end) {
      return { from: end, to: upto };
    }
  }
  return null;
});

const data = defineLanguageFacet({});

const html = parseCode({
  htmlParser: htmlLanguage.parser,
});

const markdownParser = parser.configure([
  html,
  GFM,
  Subscript,
  Superscript,
  Emoji,
  {
    props: [
      headingProp.add(isHeading),
      indentNodeProp.add({
        Document: () => null,
      }),
      languageDataProp.add({
        Document: data,
      }),
    ],
  },
]);

const markdownLanguage = new Language(data, markdownParser, [], 'markdown');

export { markdownLanguage, headingFold };
