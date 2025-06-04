import { flatten, hasOverlap } from '@text-editor/utils';
import { ChangeSet, EditorState, Facet } from '@codemirror/state';

interface DeletionEnlargerSpec {
  source: {
    from: number;
    to: number;
  };
  target: {
    from: number;
    to: number;
  };
}

type DeletionEnlargerProvider = (state: EditorState) => DeletionEnlargerSpec[];

const extension = EditorState.transactionFilter.of(tr => {
  const providers = tr.startState.facet(deletionEnlarger);

  const specs = flatten(providers.map(provider => provider(tr.startState)));

  const { length } = tr.startState.doc;
  let changes = ChangeSet.empty(length);

  tr.changes.iterChanges((fromA, toA, fromB, toB) => {
    const isDeletion = fromB === toB;

    if (!isDeletion) {
      return;
    }

    for (const spec of specs) {
      if (
        hasOverlap(
          {
            from: fromA,
            to: toA,
          },
          spec.source,
        )
      ) {
        const change = ChangeSet.of([{ ...spec.target, insert: '' }], length);

        changes = changes.compose(change.map(changes));
      }
    }
  });

  const nextChanges = changes.map(tr.changes);

  if (nextChanges.empty) {
    return tr;
  }

  return [
    tr,
    {
      changes: nextChanges,
      sequential: true,
    },
  ];
});

const deletionEnlarger = Facet.define<DeletionEnlargerProvider>({
  enables: extension,
});

export { deletionEnlarger };

export type { DeletionEnlargerSpec };
