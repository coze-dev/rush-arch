import { createPortal } from 'react-dom';
import { useLayoutEffect, type ReactNode } from 'react';

import { useHTMLElement } from '@text-editor/react-hooks';
import { useInjector } from '@text-editor/react';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';

class InlayHintWidget extends WidgetType {
  constructor(public element: HTMLElement) {
    super();
  }

  override eq(other: InlayHintWidget): boolean {
    return this.element === other.element;
  }

  toDOM() {
    return this.element;
  }
}

interface CursorInlayHintProps {
  children?: ReactNode;
}

function CursorInlayHint({ children }: CursorInlayHintProps): ReactNode {
  const injector = useInjector();
  const element = useHTMLElement('span');

  useLayoutEffect(
    () =>
      injector.inject([
        EditorView.decorations.compute(['selection'], state =>
          Decoration.set([
            Decoration.widget({
              widget: new InlayHintWidget(element),
              side: 1,
            }).range(state.selection.main.head),
          ]),
        ),
      ]),
    [injector],
  );

  return createPortal(children, element);
}

export { CursorInlayHint };
