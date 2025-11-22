/* eslint-disable complexity */

import { type SyntaxNode } from '@lezer/common';

function extractElementData(node: SyntaxNode, text: string) {
  const openTag = node.firstChild;

  let tagName: string | null = null;
  const attributes: Record<string, any> = {};

  if (openTag && openTag.name === 'OpenTag' && openTag.firstChild) {
    let sibling = openTag.firstChild.nextSibling;
    while (true) {
      if (!sibling) {
        break;
      }

      if (sibling.name === 'TagName') {
        const { from, to } = sibling;
        tagName = text.slice(from, to);
      } else if (sibling.name === 'Attribute') {
        const nameNode = sibling.firstChild;
        const isNode = nameNode?.nextSibling;
        const valueNode = isNode?.nextSibling;
        if (
          nameNode?.name === 'AttributeName' &&
          isNode?.name === 'Is' &&
          (valueNode?.name === 'AttributeValue' ||
            valueNode?.name === 'UnquotedAttributeValue')
        ) {
          const name = text.slice(nameNode.from, nameNode.to);
          const fullValue = text.slice(valueNode.from, valueNode.to);

          let value = fullValue;
          if (valueNode.name === 'AttributeValue') {
            value = fullValue.slice(1, -1);
          }

          try {
            attributes[name] = JSON.parse(decodeURIComponent(value));
          } catch (e) {
            /* empty */
          }
        } else if (
          nameNode?.name === 'AttributeName' &&
          !isNode &&
          !valueNode
        ) {
          const name = text.slice(nameNode.from, nameNode.to);
          attributes[name] = true;
        }
      }

      sibling = sibling.nextSibling;
    }
  }

  if (tagName) {
    return {
      tagName,
      attributes,
    };
  }
}

export { extractElementData };
