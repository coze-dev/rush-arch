import { syntaxTree } from '@codemirror/language';
import { EditorState, StateField } from '@codemirror/state';
import { SelectionEnlargerSpec } from '@coze-editor/editor';
import { findSlotClosing, getSlotOpenTag, isSlotOpen } from '../shared';
import { TAG } from './const';

type Range = { from: number; to: number };
type SlotInfo = {
  from: number;
  to: number;
  open: Range;
  close: Range;
}

function getSlots(state: EditorState) {
  const tree = syntaxTree(state)
  const slots: SlotInfo[] = []

  const cursor = tree.cursor()

  do {
    if (isSlotOpen(cursor.node, state) && getSlotOpenTag(cursor.node, state) === TAG) {
      const open = cursor.node
      const close = findSlotClosing(cursor.node, state, TAG)

      if (close) {
        slots.push({
          from: open.from,
          to: close.to,
          open: {
            from: open.from,
            to: open.to,
          },
          close: {
            from: close.from,
            to: close.to,
          }
        })
      }
    }
  } while (cursor.next())

  return slots
}

function getSlotRanges(state: EditorState) {
  const slots = getSlots(state)

  const specs: SelectionEnlargerSpec[] = []
  const contents: Range[] = []
  slots.forEach(slot => {
    specs.push({
      source: {
        from: slot.open.from,
        to: slot.open.to,
      },
      target: {
        from: slot.from,
        to: slot.to,
      },
    })

    specs.push({
      source: {
        from: slot.close.from,
        to: slot.close.to,
      },
      target: {
        from: slot.from,
        to: slot.to,
      },
    })

    contents.push({
      from: slot.open.to,
      to: slot.close.from,
    })
  })

  return {
    specs,
    contents,
  }
}

const field = StateField.define({
  create(state) {
    return getSlotRanges(state)
  },
  update(value, tr) {
    if (tr.docChanged) {
      return getSlotRanges(tr.state)
    }

    return value
  },
})

function isPositionInsideEditBlock(state: EditorState, pos: number) {
  const data = state.field(field)
  return data.contents.some(range => {
    return pos >= range.from && pos <= range.to
  })
}

export default field

export {
  isPositionInsideEditBlock,
}
