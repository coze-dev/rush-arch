import { extractElementData } from './utils';
import { parse } from './language';

interface EditorElement<Attrs = Record<string, any>> {
  type: 'element';
  tagName: string;
  attributes: Attrs;
  raw?: string;
}

interface EditorText {
  type: 'text';
  value: string;
}

type EditorNode = EditorElement | EditorText;

const schemaUtils = {
  toJSON(text: string): EditorNode[] {
    const tree = parse(text);
    const tags: {
      from: number;
      to: number;
      tagName: string;
      attributes: Record<string, any>;
      raw: string;
    }[] = [];
    tree.iterate({
      enter(node) {
        if (node.name === 'Element' && node.matchContext(['Document'])) {
          const data = extractElementData(node.node, text);
          if (data) {
            tags.push({
              from: node.from,
              to: node.to,
              raw: text.slice(node.from, node.to),
              ...data,
            });
          }
        }
      },
    });

    let pos = 0;
    const elements: EditorNode[] = [];
    for (const tag of tags) {
      const { from, to, tagName, attributes, raw } = tag;
      const { cmid, ...restAttributes } = attributes ?? {};

      // overlap, skip this element
      if (from < pos) {
        continue;
      }

      if (from > pos) {
        elements.push({
          type: 'text',
          value: text.slice(pos, from),
        });
      }

      elements.push({
        type: 'element',
        tagName,
        attributes: restAttributes,
        raw,
      });

      pos = to;
    }

    if (pos < text.length) {
      elements.push({
        type: 'text',
        value: text.slice(pos),
      });
    }

    return elements;
  },
  fromJSON(elements: EditorNode[]): string {
    return elements
      .map(el => {
        if (el.type === 'element') {
          return toElementString(el);
        } else if (el.type === 'text') {
          return el.value;
        }
        return '';
      })
      .join('');
  },
};

function toElementString(element: Omit<EditorElement, 'type'>) {
  const attrsString = attributesToString(element.attributes);
  return `<${element.tagName}${attrsString ? ` ${attrsString}` : ''}></${element.tagName}>`;
}

const INTERNAL_ID = 'cmid';

function uniqueId() {
  return `e${Math.random()}`;
}

function attributesToString(attributes: EditorElement['attributes']) {
  const array: string[] = [];
  let hasId = false;

  Object.keys(attributes).forEach(key => {
    if (key === INTERNAL_ID) {
      hasId = true;
    }
    const value = attributes[key];
    if (value === true) {
      array.push(key);
    } else if (typeof value !== 'undefined') {
      array.push(`${key}="${encodeURIComponent(JSON.stringify(value))}"`);
    }
  });

  if (!hasId) {
    array.unshift(
      `${INTERNAL_ID}="${encodeURIComponent(JSON.stringify(uniqueId()))}"`,
    );
  }

  return array.join(' ');
}

export { schemaUtils, toElementString, INTERNAL_ID };
export type { EditorNode, EditorElement, EditorText };
