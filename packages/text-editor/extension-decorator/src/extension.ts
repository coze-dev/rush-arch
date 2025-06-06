import { Decoration, EditorView } from '@codemirror/view';
import { type EditorState, StateEffect, StateField } from '@codemirror/state';

interface BaseDecorationSpec {
  from: number;
  to: number;
  data: any;
}

interface ReplaceDecorationSpec extends BaseDecorationSpec {
  type: 'replace';
  spec: Parameters<typeof Decoration.replace>[0];
  atomicRange: boolean;
}

interface WidgetDecorationSpec extends BaseDecorationSpec {
  type: 'widget';
  spec: Parameters<typeof Decoration.widget>[0];
}

interface LineDecorationSpec extends BaseDecorationSpec {
  type: 'line';
  spec: Parameters<typeof Decoration.line>[0];
}

interface MarkDecorationSpec extends BaseDecorationSpec {
  type: 'mark';
  spec: Parameters<typeof Decoration.mark>[0];
}

type AddDecorationSpec =
  | ReplaceDecorationSpec
  | WidgetDecorationSpec
  | LineDecorationSpec
  | MarkDecorationSpec;

type UpdateDecorationSpec =
  | Omit<ReplaceDecorationSpec, 'from' | 'to' | 'data'>
  | Omit<WidgetDecorationSpec, 'from' | 'to' | 'data'>
  | Omit<LineDecorationSpec, 'from' | 'to' | 'data'>
  | Omit<MarkDecorationSpec, 'from' | 'to' | 'data'>;

const add = StateEffect.define<AddDecorationSpec>();
const remove = StateEffect.define<Decoration>();
const update = StateEffect.define<{
  target: Decoration;
  newDecoration: Decoration;
}>();

function getDecoration(
  value: UpdateDecorationSpec & { data: any; atomicRange?: boolean },
) {
  switch (value.type) {
    case 'replace':
      return Decoration[value.type]({
        ...value.spec,
        data: value.data,
        atomicRange: value.atomicRange,
      });
    case 'widget':
      return Decoration[value.type]({
        ...value.spec,
        data: value.data,
      });
    case 'mark':
      return Decoration[value.type]({
        ...value.spec,
        data: value.data,
      });
    case 'line':
      return Decoration[value.type]({
        ...value.spec,
        data: value.data,
      });
  }
}

const field = StateField.define({
  create() {
    return Decoration.set([]);
  },
  update(value, tr) {
    let decorations = value;

    if (!tr.changes.empty) {
      decorations = decorations.map(tr.changes);
    }

    for (const effect of tr.effects) {
      if (effect.is(add)) {
        const deco = getDecoration(effect.value)?.range(
          effect.value.from,
          effect.value.to,
        );
        if (deco) {
          decorations = value.update({
            add: [deco],
            sort: true,
          });
        }
      } else if (effect.is(remove)) {
        decorations = value.update({
          filter(_from, _to, value) {
            if (value.eq(effect.value)) {
              return false;
            }
            return true;
          },
        });
      } else if (effect.is(update)) {
        const { target, newDecoration } = effect.value;

        const cursor = value.iter();
        let found: {
          value: Decoration;
          from: number;
          to: number;
        } | null = null;

        while (cursor.value) {
          if (cursor.value.eq(target)) {
            found = {
              value: cursor.value,
              from: cursor.from,
              to: cursor.to,
            };
            break;
          }
          cursor.next();
        }

        if (!found) {
          continue;
        }

        decorations = value.update({
          add: [newDecoration.range(found.from, found.to)],
          filter(_from, _to, value) {
            if (value.eq(target)) {
              return false;
            }
            return true;
          },
        });
      }
    }

    return decorations;
  },
  provide(field) {
    return [
      EditorView.decorations.of(view => view.state.field(field)),
      EditorView.atomicRanges.of(view =>
        view.state.field(field).update({
          filter(_from, _to, value) {
            return value.spec.atomicRange === true;
          },
        }),
      ),
    ];
  },
  // TODO: initial value
  // fromJSON(json, state) {

  // },
});

function decorator() {
  return [field];
}

function findDecoration<T = unknown>(
  state: EditorState,
  fn: (data: T) => boolean,
): Decoration | undefined {
  const decorations = state.field(field);
  const cursor = decorations.iter();
  while (cursor.value) {
    if (fn(cursor.value.spec.data)) {
      return cursor.value;
    }
  }
}

function updateDecoration(decoration: Decoration, spec: UpdateDecorationSpec) {
  return update.of({
    target: decoration,
    newDecoration: getDecoration({
      ...spec,
      data: decoration.spec.data,
      atomicRange: decoration.spec.atomicRange,
    }),
  });
}

function addDecoration(value: AddDecorationSpec) {
  return add.of(value);
}

function removeDecoration(decoration: Decoration) {
  return remove.of(decoration);
}

const effects = {
  add: addDecoration,
  remove: removeDecoration,
  update: updateDecoration,
};

export default decorator;

export { findDecoration, effects };

export type { AddDecorationSpec, UpdateDecorationSpec };
