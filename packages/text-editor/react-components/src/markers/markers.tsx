import { useCallback, useLayoutEffect } from 'react';

import { useStateField } from '@coze-editor/react-hooks';
import { useInjector } from '@coze-editor/react';
import { mergeableMarkers } from '@coze-editor/extensions';

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
