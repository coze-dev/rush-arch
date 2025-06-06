import type { Facet } from '@codemirror/state';

interface GutterLineMarkerSpec {
  lineNumber: number;
  dom: HTMLElement;
}

type GutterLineMarkerSpecFacet = Facet<GutterLineMarkerSpec>;

export type { GutterLineMarkerSpec, GutterLineMarkerSpecFacet };
