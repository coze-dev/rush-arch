import { createPortal, flushSync } from 'react-dom';
import { createElement, type ReactNode } from 'react';

import { createRoot, type Root } from 'react-dom/client';
import { type SyntaxNode } from '@lezer/common';
import { FacetCombineStrategy } from '@coze-editor/utils';
import { connector } from '@coze-editor/react';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  WidgetType,
} from '@codemirror/view';
import {
  EditorSelection,
  type EditorState,
  Facet,
  RangeSetBuilder,
  StateField,
} from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

import { extractElementData } from './utils';
import {
  type EditorElement,
  type EditorNode,
  INTERNAL_ID,
  schemaUtils,
} from './schema';
import { ElementProvider } from './context';

interface ElementDefinition<Attrs = any> {
  render: (props: Attrs) => ReactNode;
  toString?: (element: EditorElement<Attrs>) => string;
}

interface ElementsDefinition {
  [key: string]: ElementDefinition;
}

class ElementWidget extends WidgetType {
  public $$type = 'element';
  private root: Root;
  private element: HTMLElement;
  private view: EditorView | null = null;
  constructor(
    public definition: ElementDefinition,
    public id: string,
    public props: any,
  ) {
    super();

    const element = document.createElement('span');
    this.element = element;
    this.root = createRoot(element);
  }

  get elementId() {
    return `element-${this.id}`;
  }

  toDOM(view: EditorView) {
    this.view = view;

    const c = view.state.facet(connector);
    queueMicrotask(() => {
      flushSync(() => {
        const jsxElement = createElement(ElementProvider, {
          internalId: this.id,
          children: createElement(this.definition.render, this.props),
        });
        c.connect(this.elementId, createPortal(jsxElement, this.element));
      });
    });
    return this.element;
  }

  eq(other: ElementWidget) {
    return (
      this.id === other.id &&
      this.props &&
      other.props &&
      JSON.stringify(this.props) === JSON.stringify(other.props)
    );
  }

  destroy(): void {
    if (this.view) {
      const c = this.view.state.facet(connector);
      c.disconnect(this.elementId);
    }
  }

  ignoreEvent(event: Event): boolean {
    return false;
  }
}

// function isElementWidget(widget: WidgetType | null) {
//   return (widget as any)?.$$type === 'element';
// }

const elementsFacet = Facet.define<
  ElementsDefinition | undefined,
  ElementsDefinition | undefined
>({
  combine: FacetCombineStrategy.Last,
});

const field = StateField.define({
  create(state) {
    return build(state);
  },
  update(value, tr) {
    if (tr.docChanged) {
      return build(tr.state);
    }
    return value;
  },
  provide(f) {
    return [
      EditorView.decorations.of(view => view.state.field(f)),
      EditorView.atomicRanges.of(view => view.state.field(f)),
    ];
  },
});

function build(state: EditorState): DecorationSet {
  const allElements = state.facet(elementsFacet);

  if (!allElements) {
    return Decoration.none;
  }

  const tree = syntaxTree(state);
  const builder = new RangeSetBuilder<Decoration>();
  tree.iterate({
    enter(node) {
      const data = extract(node.node, state);
      if (data) {
        const definition = allElements[data.tagName];
        if (definition) {
          builder.add(
            node.from,
            node.to,
            Decoration.replace({
              widget: new ElementWidget(
                definition,
                data.internalId,
                data.props,
              ),
            }),
          );
        }
      }

      if (node.matchContext(['Document'])) {
        return false;
      }

      return true;
    },
  });

  const decorations = builder.finish();

  return decorations;
}

function extract(node: SyntaxNode, state: EditorState) {
  if (node.name === 'Element') {
    const elementData = extractElementData(node.node, state.doc.toString());

    if (elementData) {
      const { tagName, attributes } = elementData;
      const { [INTERNAL_ID]: internalId, ...props } = attributes ?? {};

      return {
        tagName,
        internalId,
        props,
      };
    }
  }
}

const CUSTOM_CLIPBOARD_MIMETYPE = 'application/x-with-elements';

const copyPasteHandler = EditorView.domEventHandlers({
  paste(event, view) {
    try {
      const xText = event.clipboardData?.getData(CUSTOM_CLIPBOARD_MIMETYPE);
      const plainText = event.clipboardData?.getData('text/plain');

      const text = xText ?? plainText ?? '';

      const nodes = schemaUtils.toJSON(text);
      const newText = schemaUtils.fromJSON(
        nodes
          .map(node => {
            if (node.type === 'text') {
              return node;
            }

            if (node.type === 'element') {
              return {
                ...node,
                attributes: {
                  ...(node.attributes ?? {}),
                  cmid: `e${Math.random()}`,
                },
              } satisfies EditorElement;
            }
          })
          .filter(v => isEditorNode(v)),
      );

      view.dispatch({
        changes: {
          from: view.state.selection.main.from,
          to: view.state.selection.main.to,
          insert: newText,
        },
        selection: EditorSelection.cursor(
          view.state.selection.main.from + newText.length,
        ),
      });
      return true;
    } catch (e) {
      return false;
    }
  },
  copy(event, view) {
    const definitions = view.state.facet(elementsFacet);

    if (!definitions) {
      return false;
    }

    try {
      const { from, to } = view.state.selection.main;
      const slice = view.state.doc.sliceString(from, to);
      const nodes = schemaUtils.toJSON(slice);

      const plainText = nodes
        .map(node => {
          if (node.type === 'text') {
            return node.value;
          }

          if (node.type === 'element') {
            const definition = definitions[node.tagName];
            const toString = definition?.toString;

            if (!definition) {
              return node.raw ?? '';
            }

            if (
              Object.prototype.hasOwnProperty.call(definition, 'toString') &&
              typeof toString === 'function'
            ) {
              return toString(node);
            }

            return `[${node.tagName}]`;
          }

          return '';
        })
        .join('');

      event.clipboardData?.setData('text/plain', plainText);
      event.clipboardData?.setData(CUSTOM_CLIPBOARD_MIMETYPE, slice);

      return true;
    } catch (e) {
      return false;
    }
  },
});

function isEditorNode(v: unknown): v is EditorNode {
  return Boolean(v);
}

function chatExtension() {
  return [
    field,
    copyPasteHandler,
    // selectionEnlarger.of(state => {
    //   const decorations = state.field(field);
    //   const cursor = decorations.iter();
    //   const array = [];

    //   while (cursor.value) {
    //     const widget = cursor.value.spec?.widget;
    //     const { from, to } = cursor;
    //     if (isElementWidget(widget)) {
    //       array.push({
    //         source: { from, to },
    //         target: { from, to },
    //       });
    //     }

    //     cursor.next();
    //   }

    //   return array;
    // }),
  ];
}

export { field, chatExtension, elementsFacet, CUSTOM_CLIPBOARD_MIMETYPE };

export type { ElementsDefinition, ElementDefinition };
