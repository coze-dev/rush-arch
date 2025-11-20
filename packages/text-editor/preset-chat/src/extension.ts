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
  type EditorState,
  Facet,
  RangeSetBuilder,
  StateField,
} from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

import { extractElementData } from './utils';
import { INTERNAL_ID } from './schema';
import { ElementProvider } from './context';

interface ElementDefinition {
  render: (props: any) => ReactNode;
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

const elementsFacet = Facet.define<ElementsDefinition, ElementsDefinition>({
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
  const tree = syntaxTree(state);
  const builder = new RangeSetBuilder<Decoration>();
  tree.iterate({
    enter(node) {
      const data = extract(node.node, state);
      if (data) {
        const allElements = state.facet(elementsFacet);
        const definition = allElements[data.tagName];
        builder.add(
          node.from,
          node.to,
          Decoration.replace({
            widget: new ElementWidget(definition, data.internalId, data.props),
          }),
        );
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

function chatExtension() {
  return [
    field,
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

export { field, chatExtension, elementsFacet };

export type { ElementsDefinition };
