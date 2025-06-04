// modified from @codemirror/view
// updates:
// - support handle user events(remove pointerEvents = "none", remove cloneNode)
// - use single view
// - support multiple content sources(use last one)

import { FacetCombineStrategy } from '@text-editor/utils';
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from '@codemirror/view';
import { type Extension, Facet } from '@codemirror/state';

import { clientRectsFor, flattenRect } from './dom';

function createPlaceholderWidgetClass() {
  return class Placeholder extends WidgetType {
    constructor(
      readonly content:
        | string
        | HTMLElement
        | ((view: EditorView) => HTMLElement),
    ) {
      super();
    }

    toDOM(view: EditorView) {
      const wrap = document.createElement('span');
      wrap.className = 'cm-placeholder';
      // solved the cursor height problem(eg. cursor double height with two lines)
      wrap.style.cssText = `
      height: 0;
    `;
      // wrap.style.pointerEvents = "none"
      wrap.appendChild(
        typeof this.content === 'string'
          ? document.createTextNode(this.content)
          : typeof this.content === 'function'
            ? this.content(view)
            : this.content,
      );
      if (typeof this.content === 'string') {
        wrap.setAttribute('aria-label', `placeholder ${this.content}`);
      } else {
        wrap.setAttribute('aria-hidden', 'true');
      }
      return wrap;
    }

    coordsAt(dom: HTMLElement) {
      const rects = dom.firstChild ? clientRectsFor(dom.firstChild) : [];
      if (!rects.length) {
        return null;
      }
      const style = window.getComputedStyle(dom.parentNode as HTMLElement);
      const rect = flattenRect(rects[0], style.direction != 'rtl');
      const lineHeight = parseInt(style.lineHeight);
      if (rect.bottom - rect.top > lineHeight * 1.5) {
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.top + lineHeight,
        };
      }
      return rect;
    }

    ignoreEvent() {
      return false;
    }
  };
}

const Placeholder = createPlaceholderWidgetClass();

type Content = string | HTMLElement | ((view: EditorView) => HTMLElement);
const contentFacet = Facet.define({
  combine: FacetCombineStrategy.Last<Content>,
});

const placeholderView = ViewPlugin.fromClass(
  class PlaceholderView {
    private placeholder: DecorationSet;
    private content: Content | undefined;

    constructor(private readonly view: EditorView) {
      const content = view.state.facet(contentFacet);
      this.placeholder = this.getPlaceholder(content);
    }

    update(update: ViewUpdate) {
      const content = update.view.state.facet(contentFacet);

      if (this.content !== content) {
        this.placeholder = this.getPlaceholder(content);
        this.content = content;
      }
    }

    getPlaceholder(content: Content) {
      return content
        ? Decoration.set([
            Decoration.widget({
              widget: new Placeholder(content),
              side: 1,
            }).range(0),
          ])
        : Decoration.none;
    }

    get decorations() {
      return this.view.state.doc.length ? Decoration.none : this.placeholder;
    }
  },
  {
    decorations: v => v.decorations,
  },
);

function placeholder(content: Content): Extension {
  return [placeholderView, contentFacet.of(content)];
}

export { placeholder, createPlaceholderWidgetClass };
