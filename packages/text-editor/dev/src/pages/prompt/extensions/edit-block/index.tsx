import { useLayoutEffect } from 'react';
import { useInjector } from '@coze-editor/editor/react';
import {
  SpanWidget,
  astDecorator,
  autoSelectRanges,
  deletionEnlarger,
  selectionEnlarger
} from '@coze-editor/editor';

import field from './field';
import { TAG } from './const';
import { findSlotClosing, getSlotOpenTag, getSlotPlaceholder, isSlotOpen } from '../shared';

import './index.css'

function EditBlock() {
  const injector = useInjector()

  useLayoutEffect(() => {
    if (!injector) {
      return
    }

    return injector.inject([
      astDecorator.whole.of((cursor, state) => {
        if (isSlotOpen(cursor.node, state) && getSlotOpenTag(cursor.node, state) === TAG) {
          const text = state.sliceDoc(cursor.from, cursor.to)

          const placeholder = getSlotPlaceholder(text) ?? ''
          const open = cursor.node
          const close = findSlotClosing(cursor.node, state, TAG)

          if (close) {
            const from = open.to
            const to = close.from

            if (from === to) {
              return [
                {
                  type: 'replace',
                  widget: new SpanWidget({ className: 'slot-side-left' }),
                  atomicRange: true,
                  from: open.from,
                  to: open.to,
                },
                {
                  type: 'widget',
                  widget: new SpanWidget({ text: placeholder, className: 'placeholder' }),
                  from: from,
                  atomicRange: true,
                  side: 1,
                },
                {
                  type: 'replace',
                  widget: new SpanWidget({ className: 'slot-side-right' }),
                  atomicRange: true,
                  from: close.from,
                  to: close.to,
                },
              ]
            }

            return [
              {
                type: 'replace',
                widget: new SpanWidget({ className: 'slot-side-left' }),
                atomicRange: true,
                from: open.from,
                to: open.to,
              },
              {
                type: 'className',
                className: 'slot-content',
                from,
                to,
              },
              {
                type: 'replace',
                widget: new SpanWidget({ className: 'slot-side-right' }),
                atomicRange: true,
                from: close.from,
                to: close.to,
              }
            ]
          }
        }
      }),

      field,

      autoSelectRanges.of(state => {
        return state.field(field).contents
      }),

      selectionEnlarger.of(state => {
        return state.field(field).specs;
      }),

      deletionEnlarger.of(state => {
        return state.field(field).specs;
      })
    ])
  }, [injector])

  return null
}

export default EditBlock
