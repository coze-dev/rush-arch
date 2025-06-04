import { Decoration, EditorView } from '@codemirror/view';
import { Facet, type RangeSet, RangeSetBuilder } from '@codemirror/state';

import { type MarkDecorationSpec, squash } from './squash';

const cache = new Map<string, Decoration>();
function getClassNameDecoration(className: string) {
  const cacheKey = className;

  if (!cache.has(cacheKey)) {
    const mark = Decoration.mark({ class: className });
    cache.set(cacheKey, mark);
  }

  return cache.get(cacheKey)!;
}

const mergeableMarkers = Facet.define<
  MarkDecorationSpec[],
  RangeSet<Decoration>
>({
  combine(specs) {
    const builder = new RangeSetBuilder<Decoration>();

    const flattened = specs.reduce(
      (memo, current) => [...memo, ...current],
      [],
    );

    for (const spec of squash(flattened)) {
      const decoration = getClassNameDecoration(spec.className);
      builder.add(spec.from, spec.to, decoration);
    }

    return builder.finish();
  },
  enables(self) {
    return EditorView.decorations.compute([self], state => state.facet(self));
  },
});

export { mergeableMarkers };
