import { hasOverlap } from '@text-editor/utils';
import { EditorSelection, EditorState, Facet } from '@codemirror/state';

interface Range {
  from: number;
  to: number;
}

const extension = [
  // 禁止编辑
  EditorState.changeFilter.of(tr => {
    const providers = tr.startState.facet(frozenRanges);
    const specs: Range[] = providers.reduce<Range[]>(
      (memo, provider) => [...memo, ...provider(tr.startState)],
      [],
    );
    if (Array.isArray(specs)) {
      const flattened = specs.reduce<number[]>(
        (memo, current) => [...memo, current.from, current.to],
        [],
      );

      return flattened;
    }

    return true;
  }),
  // forbid cursor move into frozen ranges
  EditorState.transactionFilter.of(tr => {
    const len = tr.startState.doc.length;

    const providers = tr.startState.facet(frozenRanges);
    const specs: Range[] = providers
      .reduce<
        Range[]
      >((memo, provider) => [...memo, ...provider(tr.startState)], [])
      .filter(
        spec =>
          spec.from >= 0 && spec.from < len && spec.to >= 0 && spec.to < len,
      );

    let { newSelection } = tr;
    newSelection.ranges.forEach((range, index) => {
      for (const spec of specs) {
        if (range.empty && range.from > spec.from && range.to < spec.to) {
          newSelection = newSelection.replaceRange(
            EditorSelection.cursor(
              range.assoc > 0 ? spec.from : spec.to,
              range.assoc,
            ),
            index,
          );
        }

        if (!range.empty && hasOverlap(range, spec)) {
          const isReversed = range.head < range.anchor;

          if (
            // anchor at left
            range.anchor < spec.from
          ) {
            newSelection = newSelection.replaceRange(
              EditorSelection.range(
                range.anchor,
                spec.from,
                range.goalColumn,
                range.bidiLevel ?? undefined,
              ),
              index,
            );
          } else if (
            // anchor at right
            range.anchor > spec.to
          ) {
            newSelection = newSelection.replaceRange(
              EditorSelection.range(
                range.anchor,
                spec.to,
                range.goalColumn,
                range.bidiLevel ?? undefined,
              ),
              index,
            );
          } else if (
            // anchor inside
            range.anchor >= spec.from &&
            range.anchor <= spec.to
          ) {
            // if both anchor and head are inside spec, we should remove this selection
            if (isReversed) {
              newSelection = newSelection.replaceRange(
                EditorSelection.range(
                  spec.from,
                  Math.min(range.head, spec.from),
                  range.goalColumn,
                  range.bidiLevel ?? undefined,
                ),
                index,
              );
            } else {
              newSelection = newSelection.replaceRange(
                EditorSelection.range(
                  spec.to,
                  Math.max(range.head, spec.to),
                  range.goalColumn,
                  range.bidiLevel ?? undefined,
                ),
                index,
              );
            }
          }
        }
      }
    });

    if (newSelection.eq(tr.newSelection)) {
      return tr;
    }

    return [
      tr,
      {
        selection: newSelection,
      },
    ];
  }),
];

type FrozenRangesProvider = (state: EditorState) => Range[];

const frozenRanges = Facet.define<FrozenRangesProvider>({
  enables: () => extension,
});

export { extension, frozenRanges };
