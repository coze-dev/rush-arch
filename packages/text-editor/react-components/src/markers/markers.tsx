import { useCallback, useLayoutEffect } from 'react';

import { useStateField } from '@text-editor/react-hooks';
import { useInjector } from '@text-editor/react';
import { mergeableMarkers } from '@text-editor/extensions';

interface MarkerDecorationSpec {
  from: number;
  to: number;
  className: string;
}

interface MarkersProps {
  markers: MarkerDecorationSpec[];
}

function Markers({ markers }: MarkersProps) {
  const injector = useInjector();
  const field = useStateField(useCallback(() => markers, [markers]));

  useLayoutEffect(
    () => injector.inject([field, mergeableMarkers.from(field)]),
    [injector, field],
  );

  return null;
}

export { Markers };

export type { MarkerDecorationSpec };
