import { useCallback, useLayoutEffect } from 'react';

import { useStateField } from '@text-editor/react-hooks';
import { useInjector } from '@text-editor/react';
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';

interface MarkerProps {
  // 1-based
  line: number;
  className: string;
}

const cache = new Map<string, Decoration>();
function getClassNameLineDecoration(className: string) {
  if (!cache.has(className)) {
    cache.set(className, Decoration.line({ class: className }));
  }

  return cache.get(className)!;
}

/*
 * 1-based
 */
function LineMarker({ line, className }: MarkerProps): null {
  const injector = useInjector();

  const field = useStateField<DecorationSet>(
    useCallback(
      state => {
        if (typeof line !== 'number') {
          return Decoration.none;
        }

        // out of range
        if (line < 1 || line > state.doc.lines) {
          return Decoration.none;
        }

        return Decoration.set([
          getClassNameLineDecoration(className).range(
            state.doc.line(line).from,
          ),
        ]);
      },
      [line, className],
    ),
  );

  useLayoutEffect(
    () =>
      injector.inject([
        field,
        EditorView.decorations.from(field, field => field),
      ]),
    [injector, field],
  );

  return null;
}

export { LineMarker };
