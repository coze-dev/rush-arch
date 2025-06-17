import { syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorAPI } from '@coze-editor/editor/preset-prompt'
import { SyntaxNode } from '@lezer/common'

// 修改 slot 存储的内容
function updateSlot(editor: EditorAPI, id: string, slotContent: string, tagName: string) {
  const state = editor.$view.state
  const tree = syntaxTree(state)
  const cursor = tree.cursor()
  do {
    if (isSlotOpen(cursor.node, state)) {
      const slice = state.sliceDoc(cursor.from, cursor.to)
      const currentID = getSlotID(slice)

      if (currentID === id) {
        const open = cursor.node
        const close = findSlotClosing(cursor.node, state, tagName)

        if (close) {
          editor.replaceTextByRange({
            from: open.to,
            to: close.from,
            text: slotContent ?? ''
          })
        }

        break
      }
    }
  } while (cursor.next())
}

// 通过 id 删除 slot
function removeSlot(editor: EditorAPI, id: string, tagName: string) {
  const state = editor.$view.state
  const tree = syntaxTree(state)
  const cursor = tree.cursor()

  do {
    if (isSlotOpen(cursor.node, state)) {
      const slice = state.sliceDoc(cursor.from, cursor.to)
      const currentID = getSlotID(slice)

      if (currentID === id) {
        const open = cursor.node
        const close = findSlotClosing(cursor.node, state, tagName)

        if (close) {
          editor.focus()
          editor.replaceTextByRange({
            from: open.from,
            to: close.to,
            text: ''
          })
        }

        break
      }
    }
  } while (cursor.next())
}

const idReg = /id="([^"]*)"/
const placeholderReg = /placeholder="([^"]*)"/

// 提取 {#slot id="..."#} 中的 id 值
function getSlotID(text: string) {
  const matches = text.match(idReg)

  return matches?.[1]
}

// 提取 {#slot placeholder="..."#} 中的 placeholder 值
function getSlotPlaceholder(text: string) {
  const matches = text.match(placeholderReg)

  return matches?.[1]
}

const slotOpenReg = /^{#\s*([\w]+)/
const slotCloseReg = /^{#\s*\/([\w]+)/

function getSlotOpenTag(node: SyntaxNode, state: EditorState) {
  if (!node || node.name !== 'JinjaComment') {
    return false
  }

  const text = state.sliceDoc(node.from, node.to)

  const matches = text.match(/{#\s*([\w]+)/)

  if (matches) {
    return matches[1]
  }
}

function getSlotCloseTag(node: SyntaxNode, state: EditorState) {
  if (!node || node.name !== 'JinjaComment') {
    return false
  }

  const text = state.sliceDoc(node.from, node.to)

  const matches = text.match(/{#\s*\/\s*([\w]+)/)

  if (matches) {
    return matches[1]
  }
}

// 判断 {#slot ...#}
function isSlotOpen(node: SyntaxNode, state: EditorState) {
  if (!node || node.name !== 'JinjaComment') {
    return false
  }

  const text = state.sliceDoc(node.from, node.to)

  return slotOpenReg.test(text)
}

// 判断 {#/slot#}
function isSlotClose(node: SyntaxNode, state: EditorState) {
  if (!node || node.name !== 'JinjaComment') {
    return false
  }

  const text = state.sliceDoc(node.from, node.to)
  return slotCloseReg.test(text)
}

// 向后查找最近的 {#/slot#} slot 闭合注释
// tagName 需匹配开始节点
// 比如：
// {#foo#} 对应的结束节点为 {#/foo#}
// {#bar#} 对应的结束节点为 {#/bar#}
function findSlotClosing(node: SyntaxNode, state: EditorState, tagName: string) {
  let next = node.nextSibling
  let close = null
  while (next) {
    if (isSlotClose(next, state) && getSlotCloseTag(next, state) === tagName) {
      close = next
      break
    }
    next = next.nextSibling
  }

  return close
}

export {
  isSlotOpen,
  isSlotClose,
  getSlotOpenTag,
  findSlotClosing,
  getSlotID,
  getSlotPlaceholder,
  updateSlot,
  removeSlot,
}
