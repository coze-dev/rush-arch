import React, { useLayoutEffect, useMemo } from 'react';

import hash from 'hash-sum';
import { useInjector } from '@text-editor/react';
import { EditorView } from '@codemirror/view';

import { BackgroundMarker } from './background-marker';

interface DiagnosticMarkerProps {
  from: number;
  to: number;
  color?: string;
}

function DiagnosticMarker({ from, to, color = 'red' }: DiagnosticMarkerProps) {
  const className = useMemo(
    () => `cm-sdk-diagnostic-marker-${hash(color)}`,
    [color],
  );

  const injector = useInjector();

  useLayoutEffect(
    () =>
      injector.inject([
        EditorView.theme({
          [`& .${className}`]: {
            backgroundPosition: 'left bottom',
            backgroundRepeat: 'repeat-x',
            paddingBottom: '0.7px',
            backgroundImage: underline(color),
          },
        }),
      ]),
    [injector, color, className],
  );

  return (
    <BackgroundMarker
      from={from}
      to={to}
      className={className}
    ></BackgroundMarker>
  );
}

function svg(content: string, attrs: string) {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${encodeURIComponent(content)}</svg>')`;
}

function underline(color: string) {
  return svg(
    `<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>`,
    'width="6" height="3"',
  );
}

export { DiagnosticMarker };
