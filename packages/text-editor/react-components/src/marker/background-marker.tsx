import { useCallback, useLayoutEffect } from 'react';

import { useStateField } from '@text-editor/react-hooks';
import { useInjector } from '@text-editor/react';
import { backgroundDecorations } from '@text-editor/extensions';

interface MarkerProps {
  from: number;
  to: number;
  className: string;
}

function BackgroundMarker({ from, to, className }: MarkerProps) {
  const injector = useInjector();

  const field = useStateField<MarkerProps>(
    useCallback(() => ({ from, to, className }), [from, to, className]),
  );

  useLayoutEffect(
    () =>
      injector.inject([
        field,
        backgroundDecorations.from(field, field => () => [field]),
      ]),
    [injector, field],
  );

  return null;
}

export { BackgroundMarker };
