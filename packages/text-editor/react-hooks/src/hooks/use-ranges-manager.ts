//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useEffect, useRef } from 'react';

import {
  type BuiltinEditorAPI,
  useEditor,
  useInjector,
} from '@coze-editor/react';
import { Decoration, type EditorView } from '@codemirror/view';
import {
  Facet,
  RangeSet,
  RangeSetBuilder,
  StateEffect,
  StateField,
} from '@codemirror/state';
import { invertedEffects } from '@codemirror/commands';

interface IDValueSpec {
  /// Whether the mark covers its start and end position or not. This
  /// influences whether content inserted at those positions becomes
  /// part of the mark. Defaults to false.
  inclusive?: boolean;
  /// Specify whether the start position of the marked range should be
  /// inclusive. Overrides `inclusive`, when both are present.
  inclusiveStart?: boolean;
  /// Whether the end should be inclusive.
  inclusiveEnd?: boolean;
  id?: string;
  [other: string]: any;
}

const enum Side {
  NonIncEnd = -6e8, // (end of non-inclusive range)
  GapStart = -5e8,
  BlockBefore = -4e8, // + widget side option (block widget before)
  BlockIncStart = -3e8, // (start of inclusive block range)
  Line = -2e8, // (line widget)
  InlineBefore = -1e8, // + widget side (inline widget before)
  InlineIncStart = -1, // (start of inclusive inline range)
  InlineIncEnd = 1, // (end of inclusive inline range)
  InlineAfter = 1e8, // + widget side (inline widget after)
  BlockIncEnd = 2e8, // (end of inclusive block range)
  BlockAfter = 3e8, // + widget side (block widget after)
  GapEnd = 4e8,
  NonIncStart = 5e8, // (start of non-inclusive range)
}

class IDValue extends Decoration {
  public id: string;

  constructor(spec: IDValueSpec) {
    const { start, end } = getInclusive(spec);

    super(
      start ? Side.InlineIncStart : Side.NonIncStart,
      end ? Side.InlineIncEnd : Side.NonIncEnd,
      null,
      spec,
    );

    this.id = spec.id ?? '';
  }

  eq(other: Decoration): boolean {
    return this.id === (other as IDValue).id;
  }
}

function getInclusive(
  spec: {
    inclusive?: boolean;
    inclusiveStart?: boolean;
    inclusiveEnd?: boolean;
  },
  block = false,
): { start: boolean; end: boolean } {
  let { inclusiveStart: start, inclusiveEnd: end } = spec;
  if (start == null) {
    start = spec.inclusive;
  }
  if (end == null) {
    end = spec.inclusive;
  }
  return { start: start ?? block, end: end ?? block };
}

const addEffect = StateEffect.define<IDRangeSpec[]>({
  map: (specs, change) =>
    specs.map(({ from, to, ...rest }) => ({
      from: change.mapPos(from),
      to: change.mapPos(to),
      ...rest,
    })),
});
const removeEffect = StateEffect.define<string[]>();
const recoverEffect = StateEffect.define<IDRangeSpec[]>();

const facet = Facet.define();

interface IDRangeSpec {
  from: number;
  to: number;
  id: string;
}

function toRangeSet(specs: IDRangeSpec[]) {
  specs.sort((a, b) => a.from - b.from);

  const builder = new RangeSetBuilder<Decoration>();
  for (const spec of specs) {
    builder.add(
      spec.from,
      spec.to,
      new IDValue({
        id: spec.id,
      }),
    );
  }
  return builder.finish();
}

function toSpecs(ranges: RangeSet<IDValue>): IDRangeSpec[] {
  const specs: IDRangeSpec[] = [];
  const cursor = ranges.iter();

  while (cursor.value) {
    specs.push({
      from: cursor.from,
      to: cursor.to,
      id: cursor.value.id,
    });
    cursor.next();
  }

  return specs;
}

type Watcher = (specs: IDRangeSpec[]) => void;

function useRangesManager() {
  const injector = useInjector();
  const editor = useEditor<BuiltinEditorAPI>();

  const watchersRef = useRef<Watcher[]>([]);

  const viewRef = useRef<EditorView | null>(null);
  viewRef.current = editor?.$view;
  const rangesStashRef = useRef<IDRangeSpec[]>([]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const field = StateField.define<RangeSet<IDValue>>({
      create() {
        if (rangesStashRef.current) {
          return toRangeSet(rangesStashRef.current);
        }
        return RangeSet.empty;
      },
      update(set, tr) {
        set = set.map(tr.changes);

        for (const effect of tr.effects) {
          if (effect.is(addEffect)) {
            const specs = effect.value ?? [];
            set = set.update({
              add: specs.map(spec =>
                new IDValue({ id: spec.id }).range(spec.from, spec.to),
              ),
            });
          }

          if (effect.is(removeEffect)) {
            const ids = effect.value;
            set = set.update({
              filter(from, to, value) {
                return !ids.includes(value.id);
              },
            });
          }

          if (effect.is(recoverEffect)) {
            const specs = effect.value ?? [];
            const ids = specs.map(spec => spec.id);
            set = set.update({
              filter(from, to, value) {
                return !ids.includes(value.id);
              },
            });
            set = set.update({
              add: specs.map(spec =>
                new IDValue({ id: spec.id }).range(spec.from, spec.to),
              ),
            });
          }
        }

        return set;
      },
    });

    const invertable = invertedEffects.of(tr => {
      const effects: StateEffect<unknown>[] = [];

      const ranges = tr.startState.field(field);
      // const length = tr.startState.doc.length

      // make effect undoable(save effects of this tr in undo/redo stack)
      // for (const effect of tr.effects) {
      //   if (effect.is(addEffect)) {
      //     const specs = effect.value ?? []
      //     effects.push(
      //       removeEffect.of(
      //         specs.map(spec => spec.id)
      //       )
      //     )
      //   }

      //   if (effect.is(removeEffect)) {
      //     const ids = effect.value
      //     const specs = []
      //     ranges.between(0, length, (from, to, value) => {
      //       if (ids.includes(value.id)) {
      //         specs.push({
      //           from,
      //           to,
      //           id: value.id
      //         })
      //       }
      //     })

      //     effects.push(
      //       addEffect.of(
      //         specs
      //       )
      //     )
      //   }
      // }

      tr.changes.iterChangedRanges((from, to) => {
        ranges.between(from, to, (rangeFrom, rangeTo, value) => {
          const f = Math.max(from, rangeFrom);
          const t = Math.min(to, rangeTo);

          // has overlapped parts
          if (f < t) {
            effects.push(
              recoverEffect.of([
                { from: rangeFrom, to: rangeTo, id: value.id },
              ]),
            );
          }
        });
      });

      return effects;
    });

    let isFirstTime = true;

    return injector.inject([
      field,
      invertable,
      facet.compute([field], state => {
        if (isFirstTime) {
          isFirstTime = false;
          return;
        }

        const set = state.field(field);
        if (
          Array.isArray(watchersRef.current) &&
          watchersRef.current.length > 0
        ) {
          const specs = toSpecs(set);
          for (const watcher of watchersRef.current) {
            watcher(specs);
          }
        }
      }),
    ]);
  }, [editor]);

  return {
    add(specs: IDRangeSpec[]) {
      if (!viewRef.current) {
        rangesStashRef.current.push(...specs);
        return;
      }

      viewRef.current.dispatch({
        effects: addEffect.of(specs),
      });
    },
    remove(ids: string[]) {
      if (!viewRef.current) {
        rangesStashRef.current = rangesStashRef.current.filter(
          item => !ids.includes(item.id),
        );
        return;
      }

      viewRef.current.dispatch({
        effects: removeEffect.of(ids),
      });
    },
    watch(watcher: Watcher) {
      watchersRef.current.push(watcher);
      return () => {
        watchersRef.current = watchersRef.current.filter(w => w !== watcher);
      };
    },
  };
}

export { useRangesManager };
