//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { createPortal } from 'react-dom';
import { forwardRef, type ReactNode, useImperativeHandle } from 'react';

import {
  useHTMLElement,
  useInjectorEffect,
  useLatest,
} from '@coze-editor/react-hooks';
import { type BuiltinEditorAPI, useEditor } from '@coze-editor/react';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { MapMode, StateEffect, StateField } from '@codemirror/state';

interface EmbededLineViewProps {
  children?: ReactNode;
}

class DOMWidget extends WidgetType {
  constructor(private options: { dom: HTMLElement }) {
    super();
  }

  toDOM() {
    return this.options.dom;
  }

  eq(other: DOMWidget) {
    return this.options.dom === other.options.dom;
  }
}

interface UpdateOptions {
  visible: boolean;
  // line number, 1-based, defaults to 1
  line?: number;
  // where to put the view, before or after the target line
  side?: EmbededLineViewSide;
}

interface EmbededLineViewRefProps {
  update: (options: UpdateOptions) => void;
}

enum EmbededLineViewSide {
  Before = 'before',
  After = 'after',
}

const updateEffect = StateEffect.define<Required<UpdateOptions>>();

const EmbededLineView = forwardRef<
  EmbededLineViewRefProps,
  EmbededLineViewProps
>(function EmbededLineView({ children }, ref) {
  const dom = useHTMLElement('div');
  const domRef = useLatest(dom);
  const editor = useEditor<BuiltinEditorAPI>();
  const editorRef = useLatest(editor);

  useImperativeHandle(ref, () => ({
    update({ visible, line, side }: UpdateOptions) {
      editorRef.current?.$view.dispatch({
        effects: updateEffect.of({
          visible,
          line: line ?? 1,
          side: side ?? EmbededLineViewSide.Before,
        }),
      });
    },
  }));

  useInjectorEffect(injector => {
    const field = StateField.define({
      create() {
        return {
          position: 0,
          side: EmbededLineViewSide.Before,
          decorations: Decoration.none,
        };
      },
      update(value, tr) {
        const newPosition = tr.changes.mapPos(
          value.position,
          -1,
          MapMode.Simple,
        );

        let newValue = value;
        if (typeof newPosition === 'number' && newPosition !== value.position) {
          const docLine = tr.state.doc.lineAt(newPosition);

          let decoPos = 0;

          if (value.side === EmbededLineViewSide.After) {
            decoPos = docLine.to;
          } else {
            decoPos = docLine.from;
          }

          newValue = {
            ...value,
            position: newPosition,
            decorations: Decoration.set([
              Decoration.widget({
                widget: new DOMWidget({
                  dom: domRef.current,
                }),
                block: true,
                side: value.side === EmbededLineViewSide.After ? 1 : -1,
              }).range(decoPos),
            ]),
          };
        }

        for (const effect of tr.effects) {
          if (effect.is(updateEffect)) {
            const { visible, line, side } = effect.value;

            if (!visible) {
              return {
                position: newValue.position,
                side,
                decorations: Decoration.none,
              };
            }

            // out of range, ignore
            if (line < 1 || line > tr.startState.doc.lines) {
              continue;
            }

            const docLine = tr.startState.doc.line(line);

            let decoPos = 0;

            if (side === EmbededLineViewSide.After) {
              decoPos = docLine.to;
            } else {
              decoPos = docLine.from;
            }

            return {
              position: decoPos,
              side,
              decorations: Decoration.set([
                Decoration.widget({
                  widget: new DOMWidget({
                    dom: domRef.current,
                  }),
                  block: true,
                  side: newValue.side === EmbededLineViewSide.After ? 1 : -1,
                }).range(decoPos),
              ]),
            };
          }
        }

        return newValue;
      },
      provide(f) {
        return EditorView.decorations.compute(
          [f],
          state => state.field(f).decorations,
        );
      },
    });

    return injector.inject([field]);
  }, []);

  return createPortal(children, dom);
});

export { EmbededLineView, EmbededLineViewSide, type EmbededLineViewRefProps };
