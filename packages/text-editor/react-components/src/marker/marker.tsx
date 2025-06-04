import { useCallback, useLayoutEffect } from 'react';

import { useStateField } from '@text-editor/react-hooks';
import { useInjector } from '@text-editor/react';
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';
import { type Transaction } from '@codemirror/state';

interface MarkerProps {
  from: number;
  to: number;
  className: string;
}

const cache = new Map<string, Decoration>();
function getClassNameDecoration(className: string) {
  const cacheKey = JSON.stringify({ className });

  if (!cache.has(cacheKey)) {
    const mark = Decoration.mark({ class: className });
    cache.set(cacheKey, mark);
  }

  return cache.get(cacheKey)!;
}

function Marker({ from, to, className }: MarkerProps) {
  const injector = useInjector();

  const field = useStateField<DecorationSet>(
    useCallback(
      () => Decoration.set([getClassNameDecoration(className).range(from, to)]),
      [from, to, className],
    ),

    useCallback(
      (value: DecorationSet, tr: Transaction) => value.map(tr.changes),
      [],
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

export { Marker };
