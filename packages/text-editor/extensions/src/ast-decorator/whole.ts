import { omit } from 'es-toolkit';
import { traverseAST } from '@text-editor/utils';
import type { Tree, TreeCursor } from '@lezer/common';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  type WidgetType,
} from '@codemirror/view';
import {
  type EditorState,
  type Range,
  Facet,
  RangeSet,
  StateEffect,
  StateField,
  Prec,
} from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

import {
  backgroundDecorations,
  backgroundDecoratorLayer,
  type BackgroundDecoration,
} from '../background-decorations';

type Precedence = 'highest' | 'high' | 'default' | 'low' | 'lowest';

interface BaseDecorationSpec {
  from?: number;
  to?: number;
  atomicRange?: boolean;
}

interface ClassNameDecorationSpec extends BaseDecorationSpec {
  type: 'className';
  className: string;
  prec?: Precedence;
}

interface ReplaceDecorationSpec extends BaseDecorationSpec {
  type: 'replace';
  widget?: WidgetType;
  inclusive?: boolean;
  inclusiveStart?: boolean;
  inclusiveEnd?: boolean;
  block?: boolean;
}

interface WidgetDecorationSpec extends BaseDecorationSpec {
  type: 'widget';
  widget: WidgetType;
  side?: number;
  inlineOrder?: boolean;
  block?: boolean;
}

interface BackgroundDecorationSpec {
  from?: number;
  to?: number;
  type: 'background';
  className: string;
}

type DecorationSpec =
  | ClassNameDecorationSpec
  | ReplaceDecorationSpec
  | WidgetDecorationSpec
  | BackgroundDecorationSpec;

type WholeASTDecorator = (
  cursor: TreeCursor,
  state: EditorState,
) => DecorationSpec[] | DecorationSpec | undefined;

const updateWholeDecorationsEffect = StateEffect.define();

function updateWholeDecorations(view: EditorView) {
  view.dispatch({
    effects: updateWholeDecorationsEffect.of(null),
  });
}

const classNameDecorationCache: Map<string, Decoration> = new Map();
function getClassDecoration(className: string): Decoration {
  if (!classNameDecorationCache.has(className)) {
    classNameDecorationCache.set(
      className,
      Decoration.mark({
        class: className,
      }),
    );
  }

  return classNameDecorationCache.get(className)!;
}

type CategoriedDecorationSet = Record<Precedence, DecorationSet>;

function buildDecorations(state: EditorState, tree: Tree) {
  const decorates = state.facet(wholeASTDecoratorFacet) ?? [];

  const treeCursor = tree.cursor();
  const decorations: CategoriedDecorationSet = {
    highest: Decoration.none,
    high: Decoration.none,
    default: Decoration.none,
    low: Decoration.none,
    lowest: Decoration.none,
  };
  let atomicRanges = RangeSet.empty;
  let backgroundDecorations: BackgroundDecoration[] = [];

  const from = 0;
  const to = state.doc.length;
  traverseAST(treeCursor, from, to, cursor => {
    decorates.forEach(decorate => {
      const decorationSpec = decorate(cursor, state);

      let specs: DecorationSpec[] = [];
      if (Array.isArray(decorationSpec)) {
        specs = decorationSpec;
      } else if (decorationSpec) {
        specs = [decorationSpec];
      }

      specs.forEach(spec => {
        const result = updateDecorationSpec(cursor, spec, {
          decorations,
          backgroundDecorations,
          atomicRanges,
        });

        if (!result) {
          return;
        }

        backgroundDecorations = result.backgroundDecorations;
        atomicRanges = result.atomicRanges;
      });
    });
  });

  return {
    decorations,
    atomicRanges,
    backgroundDecorations,
  };
}

function updateDecorationSpec(
  cursor: TreeCursor,
  decorationSpec: DecorationSpec | undefined,
  {
    decorations,
    backgroundDecorations,
    atomicRanges,
  }: {
    decorations: CategoriedDecorationSet;
    backgroundDecorations: BackgroundDecoration[];
    atomicRanges: RangeSet<any>;
  },
) {
  if (!decorationSpec) {
    return;
  }

  const from = decorationSpec.from ?? cursor.from;
  const to = decorationSpec.to ?? cursor.to;

  const omitKeys = ['type', 'from', 'to', 'atomicRange'] as const;

  let decorationRange: Range<Decoration> | null = null;
  switch (decorationSpec.type) {
    case 'className':
      // from === to marker will cause delete issue
      // e.g. {{content}} renders as `replace-widget mark replace-widget`
      // delete from end of content to start of content
      // when delete to first letter of content, the delete behavior is strange
      decorationRange =
        from === to
          ? null
          : getClassDecoration(decorationSpec.className).range(from, to);
      break;
    case 'replace':
      decorationRange = Decoration.replace(
        omit(decorationSpec, omitKeys),
      ).range(from, to);
      break;
    case 'widget':
      decorationRange = Decoration.widget(omit(decorationSpec, omitKeys)).range(
        from,
      );
      break;
    case 'background':
      backgroundDecorations.push({
        from: decorationSpec.from ?? cursor.from,
        to: decorationSpec.to ?? cursor.to,
        className: decorationSpec.className,
      });
      break;
  }

  if (decorationRange) {
    const prec =
      decorationSpec.type === 'className'
        ? (decorationSpec.prec ?? 'default')
        : 'default';

    if (decorations[prec]) {
      decorations[prec] = decorations[prec].update({
        add: [decorationRange],
        sort: true,
      });
    }
  }

  if (
    decorationSpec.type !== 'background' &&
    decorationRange &&
    decorationSpec.atomicRange === true
  ) {
    atomicRanges = atomicRanges.update({
      add: [decorationRange],
      sort: true,
    });
  }

  return {
    decorations,
    backgroundDecorations,
    atomicRanges,
  };
}

const decorateField = StateField.define<{
  decorations: CategoriedDecorationSet;
  atomicRanges: RangeSet<any>;
  backgroundDecorations: BackgroundDecoration[];
}>({
  create(state) {
    return buildDecorations(state, syntaxTree(state));
  },
  update(value, tr) {
    const tree = syntaxTree(tr.state);

    const hasUpdateEffect = tr.effects.some(effect =>
      effect.is(updateWholeDecorationsEffect),
    );
    const syntaxTreeChanged = syntaxTree(tr.startState) !== tree;
    if (syntaxTreeChanged || hasUpdateEffect) {
      value = buildDecorations(tr.state, tree);
    }
    return value;
  },
  provide(field) {
    return [
      Prec.highest(
        EditorView.decorations.compute(
          [field],
          state => state.field(field).decorations.highest,
        ),
      ),
      Prec.high(
        EditorView.decorations.compute(
          [field],
          state => state.field(field).decorations.high,
        ),
      ),
      Prec.default(
        EditorView.decorations.compute(
          [field],
          state => state.field(field).decorations.default,
        ),
      ),
      Prec.low(
        EditorView.decorations.compute(
          [field],
          state => state.field(field).decorations.low,
        ),
      ),
      Prec.lowest(
        EditorView.decorations.compute(
          [field],
          state => state.field(field).decorations.lowest,
        ),
      ),

      EditorView.atomicRanges.of(view => view.state.field(field).atomicRanges),
      backgroundDecorations.of(
        view => view.state.field(field).backgroundDecorations,
      ),
    ];
  },
});

const wholeASTDecoratorFacet = Facet.define<
  WholeASTDecorator,
  WholeASTDecorator[]
>({
  enables: [decorateField, backgroundDecoratorLayer],
});

export { wholeASTDecoratorFacet, updateWholeDecorations };

export type { WholeASTDecorator };
