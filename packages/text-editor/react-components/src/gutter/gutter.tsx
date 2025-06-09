//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { createPortal } from 'react-dom';
import React, { type ReactNode, useEffect, useState } from 'react';

import { useHydrateAtoms } from 'jotai/utils';
import { Provider, useAtomValue } from 'jotai';
import {
  useCompartment,
  useHTMLElement,
  useInjectorEffect,
  useLatest,
} from '@coze-editor/react-hooks';
import { useEditor, type BuiltinEditorAPI } from '@coze-editor/react';
import { type EditorView, gutter as leftGutter } from '@codemirror/view';
import { Facet, RangeSet } from '@codemirror/state';

import type { GutterLineMarkerSpecFacet } from './types';
import {
  gutter as rightGutter,
  GutterMarker as RawGutterMarker,
} from './right-gutter';
import { facetAtom } from './atoms';

interface GutterProps {
  defaultClassName?: string;
  placement?: GutterPlacement;
  children?: ReactNode;
}

class DOMGutterLineMarker extends RawGutterMarker {
  constructor(public dom: HTMLElement) {
    super();
  }

  eq(other: DOMGutterLineMarker) {
    return this.dom === other.dom;
  }

  toDOM() {
    return this.dom;
  }
}

interface HydrateAtomsProps {
  markers: GutterLineMarkerSpecFacet;
  children?: ReactNode;
}
function HydrateAtoms({ markers, children }: HydrateAtomsProps): JSX.Element {
  useHydrateAtoms([[facetAtom, markers]]);

  return <>{children}</>;
}

enum GutterPlacement {
  Left = 'left',
  Right = 'right',
}

function Gutter({
  defaultClassName,
  placement = GutterPlacement.Left,
  children,
}: GutterProps): ReactNode {
  const [markersFacet] = useState<GutterLineMarkerSpecFacet>(() =>
    Facet.define(),
  );

  useInjectorEffect(
    injector => {
      const gutter =
        placement === GutterPlacement.Right ? rightGutter : leftGutter;
      return injector.inject([
        gutter({
          class: defaultClassName ?? '',
          markers(view: EditorView) {
            const specs = view.state.facet(markersFacet);
            const { lines } = view.state.doc;

            let markers = RangeSet.empty;
            for (const spec of specs) {
              const { lineNumber } = spec;
              if (lineNumber < 1 || lineNumber > lines) {
                continue;
              }

              const line = view.state.doc.line(spec.lineNumber);
              markers = markers.update({
                add: [new DOMGutterLineMarker(spec.dom).range(line.from)],
                sort: true,
              });
            }

            return markers;
          },
        }),
      ]);
    },
    [placement],
  );

  return (
    <Provider>
      <HydrateAtoms markers={markersFacet}>{children}</HydrateAtoms>
    </Provider>
  );
}

interface GutterLineMarkerProps {
  // 1-based
  lineNumber: number;
  children?: ReactNode;
}

function GutterLineMarker({
  lineNumber,
  children,
}: GutterLineMarkerProps): ReactNode {
  const facet = useAtomValue(facetAtom);
  const editor = useEditor<BuiltinEditorAPI>();
  const compartment = useCompartment();
  // create stable dom, avoid extra toDOM for gutter marker
  const elementRef = useLatest(useHTMLElement());

  useInjectorEffect(injector => injector.inject([compartment.of([])]), []);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.$view.dispatch({
      effects: compartment.reconfigure(
        facet.of({
          lineNumber,
          dom: elementRef.current,
        }),
      ),
    });
  }, [editor, compartment, lineNumber]);

  return createPortal(children, elementRef.current);
}

export { Gutter, GutterLineMarker, GutterPlacement };
