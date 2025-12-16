/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { FacetCombineStrategy } from '@coze-editor/utils';
import {
  type EditorState,
  type Extension,
  Facet,
  MapMode,
  StateField,
} from '@codemirror/state';

import type { MentionOptions, TriggerContext } from './types';
import { hasTrigger, hasTriggerCharacters } from './is';

// 匹配中文、a-z、A-Z、0-9、_、'（' 用于兼容中文输入法 compose 过程）
const validForReg = /^[\u4e00-\u9fa5a-zA-Z0-9_']*$/;
function defaultValidFor(text: string) {
  return validForReg.test(text);
}

interface MentionFieldData {
  show: boolean;
  triggerContext: TriggerContext | undefined;
}

const fields = Facet.define<StateField<MentionFieldData>>();

function mention(options: MentionOptions): Extension {
  const mentionConfig = Facet.define({
    combine: FacetCombineStrategy.Last<MentionOptions>,
  });

  const field = StateField.define<MentionFieldData>({
    create() {
      return {
        show: false,
        triggerContext: undefined,
      };
    },
    update(value, tr) {
      const options = tr.startState.facet(mentionConfig);

      if (!options) {
        return value;
      }

      const { search = true, onOpenChange, onSearch, onTrigger } = options;

      let { show } = value;

      let triggerContext: TriggerContext | undefined = undefined;

      if (tr.docChanged) {
        if (hasTriggerCharacters(options)) {
          tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
            const insertString = inserted.toString();
            if (
              fromA === toA &&
              options.triggerCharacters.includes(insertString)
            ) {
              triggerContext = {
                from: fromB,
                to: toB,
                triggerCharacter: insertString,
                cursorPosition: tr.state.selection.main.head,
              };
            }
          });
        } else if (hasTrigger(options)) {
          triggerContext = options.trigger(tr);
        }

        if (triggerContext && typeof onTrigger === 'function') {
          onTrigger({
            triggerContext: {
              from: triggerContext.from,
              to: triggerContext.to,
              triggerCharacter: triggerContext.triggerCharacter,
            },
          });
        }
      }

      const isSelectUserEvent = tr.isUserEvent('select');

      const newValue: MentionFieldData = {
        show: value.show,
        triggerContext: value.triggerContext
          ? { ...value.triggerContext }
          : undefined,
      };

      if (triggerContext) {
        newValue.triggerContext = triggerContext;
        show = true;

        if (typeof onSearch === 'function') {
          onSearch({
            value: '',
          });
        }
      } else if (tr.docChanged && value.triggerContext && search) {
        // remap from & to
        if (newValue.triggerContext) {
          const newFrom = tr.changes.mapPos(
            value.triggerContext.from,
            1,
            MapMode.TrackAfter,
          );
          const newTo = tr.changes.mapPos(
            value.triggerContext.to,
            1,
            MapMode.Simple,
          );

          if (typeof newFrom === 'number' && typeof newTo === 'number') {
            newValue.triggerContext.from = newFrom;
            newValue.triggerContext.to = newTo;
          } else {
            show = false;
          }
        }

        // show is still true, let's do next step
        if (show === true) {
          const validFor =
            typeof search === 'object' ? search.validFor : defaultValidFor;
          const from = value.triggerContext.cursorPosition;
          const to = tr.state.selection.main.head;
          if (to >= from) {
            const text = tr.state.sliceDoc(from, to);
            if (validFor(text, from, to, tr.state)) {
              show = true;
              if (typeof onSearch === 'function') {
                onSearch({
                  value: text,
                });
              }
            } else {
              show = false;
            }
          } else {
            show = false;
          }
        }
      } else if (isSelectUserEvent) {
        show = false;
      }

      if (show === false) {
        newValue.triggerContext = undefined;
      }

      if (show !== value.show) {
        newValue.show = show;
        if (typeof onOpenChange === 'function') {
          onOpenChange({
            value: show,
            state: tr.state,
            triggerContext: newValue.triggerContext
              ? {
                  from: newValue.triggerContext.from,
                  to: newValue.triggerContext.to,
                  triggerCharacter: newValue.triggerContext.triggerCharacter,
                }
              : undefined,
          });
        }
      }

      return newValue;
    },
  });

  return [mentionConfig.of(options), field, fields.of(field)];
}

function getCurrentMentionReplaceRange(
  state: EditorState,
): { from: number; to: number } | undefined {
  const allFields = state.facet(fields);

  for (const field of allFields) {
    const fieldState = state.field(field, false);
    if (
      fieldState &&
      fieldState.triggerContext &&
      typeof fieldState.triggerContext.from === 'number' &&
      typeof fieldState.triggerContext.to === 'number'
    ) {
      return {
        from: fieldState.triggerContext.from,
        to: fieldState.triggerContext.to,
      };
    }
  }
}

export { mention, getCurrentMentionReplaceRange };
