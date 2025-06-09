//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { parser } from '@lezer/html';
import { LRLanguage } from '@codemirror/language';

const htmlLanguage = LRLanguage.define({
  parser: parser.configure({
    dialect: 'noMatch',
  }),
});

// function elementName(doc: Text, tree: SyntaxNode | null | undefined, max = doc.length) {
//   if (!tree) return ''
//   let tag = tree.firstChild
//   let name = tag && tag.getChild('TagName')
//   return name ? doc.sliceString(name.from, Math.min(name.to, max)) : ''
// }

// const selfClosers = new Set(
//   'area base br col command embed frame hr img input keygen link meta param source track wbr menuitem'
//     .split(' ')
// )

// const autoCloseTags = EditorView.inputHandler.of((view, from, to, text, insertTransaction) => {
//   if (
//     view.composing ||
//     view.state.readOnly ||
//     from != to ||
//     (text != '>' && text != '/')
//   ) {
//     return false
//   }

//   const base = insertTransaction(), { state } = base

//   if (!htmlLanguage.isActiveAt(state, from, -1)) {
//     return false
//   }

//   const closeTags = state.changeByRange(range => {
//     const didType = state.doc.sliceString(range.from - 1, range.to) == text
//     const { head } = range
//     const after = syntaxTree(state).resolveInner(head, -1)
//     let name

//     if (didType && text == '>' && after.name == 'EndTag') {
//       const tag = after.parent!
//       if (
//         (name = elementName(state.doc, tag.parent, head)) &&
//         !selfClosers.has(name)) {
//         const to = head + (state.doc.sliceString(head, head + 1) === '>' ? 1 : 0)
//         const insert = `</${name}>`
//         return { range, changes: { from: head, to, insert } }
//       }
//     } else if (didType && text == '/' && after.name == 'IncompleteCloseTag') {
//       const tag = after.parent!
//       if (after.from == head - 2 && tag.lastChild?.name != 'CloseTag' &&
//         (name = elementName(state.doc, tag, head)) && !selfClosers.has(name)) {
//         const to = head + (state.doc.sliceString(head, head + 1) === '>' ? 1 : 0)
//         const insert = `${name}>`
//         return {
//           range: EditorSelection.cursor(head + insert.length, -1),
//           changes: { from: head, to, insert }
//         }
//       }
//     }
//     return { range }
//   })
//   if (closeTags.changes.empty) return false
//   view.dispatch([
//     base,
//     state.update(closeTags, {
//       userEvent: 'input.complete',
//       scrollIntoView: true
//     })
//   ])
//   return true
// })

export { htmlLanguage };
