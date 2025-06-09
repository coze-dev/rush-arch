//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import React, { useLayoutEffect, useMemo } from 'react';

import hash from 'hash-sum';
import { useInjector } from '@coze-editor/react';
import { EditorView } from '@codemirror/view';

import { Markers } from './markers';

interface DiagnosticMarkerDecorationSpec {
  from: number;
  to: number;
  color?: string;
}

interface DiagnosticMarkersProps {
  markers: DiagnosticMarkerDecorationSpec[];
}

interface StyleSpec {
  [propOrSelector: string]: string | number | StyleSpec | null;
}

function DiagnosticMarkers({ markers }: DiagnosticMarkersProps) {
  const theme = useMemo<Record<string, StyleSpec>>(() => {
    const colors = getColors(markers);
    return colors.reduce((memo: Record<string, any>, color) => {
      const className = getClassNameFromColor(color);
      memo[`& .${className}`] = {
        backgroundPosition: 'left bottom',
        backgroundRepeat: 'repeat-x',
        paddingBottom: '0.7px',
        backgroundImage: underline(color),
      };
      return memo;
    }, {});
  }, [markers]);

  const injector = useInjector();

  useLayoutEffect(
    () => injector.inject([EditorView.theme(theme)]),
    [injector, theme],
  );

  const finalMarkers = useMemo(
    () =>
      markers.map(marker => {
        const className = getClassNameFromColor(marker.color ?? 'red');
        return {
          from: marker.from,
          to: marker.to,
          className,
        };
      }),
    [markers],
  );

  return <Markers markers={finalMarkers} />;
}

const isString = (v: unknown): v is string => Boolean(v);

function getColors(markers: DiagnosticMarkerDecorationSpec[]) {
  return [
    ...new Set([
      ...markers.map(marker => marker.color).filter(v => isString(v)),
      'red',
    ]),
  ];
}

function getClassNameFromColor(color: string) {
  return `cm-sdk-diagnostic-marker-${hash(color)}`;
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

export { DiagnosticMarkers };

export type { DiagnosticMarkerDecorationSpec };
