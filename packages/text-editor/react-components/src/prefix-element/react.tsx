import { createPortal } from 'react-dom';
import { type ReactNode, useLayoutEffect } from 'react';

import { useHTMLElement, useLatest } from '@coze-editor/react-hooks';
import { useInjector } from '@coze-editor/react';
import { Decoration, EditorView, keymap, WidgetType } from '@codemirror/view';

import { clientRectsFor, flattenRect } from './dom';

class PrefixElementWidget extends WidgetType {
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
    wrap.className = 'cm-prefix-element';
    // solved the cursor height problem(eg. cursor double height with two lines)
    wrap.style.cssText = 'height: 0;';
    wrap.appendChild(
      typeof this.content === 'string'
        ? document.createTextNode(this.content)
        : typeof this.content === 'function'
          ? this.content(view)
          : this.content,
    );
    if (typeof this.content === 'string') {
      wrap.setAttribute('aria-label', `prefix ${this.content}`);
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
}

interface PrefixElementProps {
  deletable?: boolean;
  onDelete?: () => void;
  children?: ReactNode;
}

function PrefixElement({ deletable, onDelete, children }: PrefixElementProps) {
  const element = useHTMLElement('span');
  const latestElement = useLatest(element);
  const latestDeletable = useLatest(deletable);
  const latestOnDelete = useLatest(onDelete);
  const injector = useInjector();

  useLayoutEffect(() => {
    function run(view: EditorView) {
      if (
        view.state.selection.main.empty &&
        view.state.selection.main.head === 0 &&
        latestDeletable.current === true &&
        typeof latestOnDelete.current === 'function'
      ) {
        latestOnDelete.current();
      }

      return false;
    }

    return injector.inject([
      EditorView.decorations.of(
        Decoration.set([
          Decoration.widget({
            side: -100,
            block: false,
            widget: new PrefixElementWidget(() => latestElement.current),
          }).range(0),
        ]),
      ),
      keymap.of([
        { key: 'Backspace', shift: run, run },
        { key: 'Meta-Backspace', shift: run, run },
      ]),
    ]);
  }, []);

  return createPortal(children, element);
}

export { PrefixElement };
