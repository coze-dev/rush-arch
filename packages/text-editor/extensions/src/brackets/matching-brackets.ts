//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';
import { type EditorState, StateField, type Range } from '@codemirror/state';

const pairs: Record<string, string> = {
  '(': ')',
  '{': '}',
  '[': ']',
  ')': '(',
  '}': '{',
  ']': '[',
};

const findMatchingBracket = (state: EditorState, cursorPos: number) => {
  try {
    const doc = state.doc.toString();
    let stack: string[] = [];
    let leftIndex = -1;
    let rightIndex = -1;

    // 向前查找
    for (let i = cursorPos - 1; i >= 0; i--) {
      const char = doc[i];
      if (pairs[char]) {
        if ([')', '}', ']'].includes(char)) {
          stack.push(char);
        } else {
          if (stack.length === 0) {
            leftIndex = i;
            break;
          }
          const lastBracket = stack.pop();
          if (pairs[char] !== lastBracket) {
            return null;
          }
        }
      }
    }

    stack = [];

    // 向后查找
    for (let i = cursorPos; i < doc.length; i++) {
      const char = doc[i];
      if (pairs[char]) {
        if (['(', '{', '['].includes(char)) {
          stack.push(char);
        } else {
          if (stack.length === 0) {
            rightIndex = i;
            break;
          }
          const lastBracket = stack.pop();
          if (pairs[char] !== lastBracket) {
            return null;
          }
        }
      }
    }

    if (leftIndex !== -1 && rightIndex !== -1) {
      return [leftIndex, rightIndex];
    }

    return null;
  } catch (e) {
    console.error('findMatchingBracket failed', e);
    return null;
  }
};

const renderMatch = (match: number) => {
  const decorations: Range<Decoration>[] = [];
  const mark = Decoration.mark({ class: 'cm-matchingBracket' });
  decorations.push(mark.range(match, match + 1));
  return decorations;
};

const bracketMatchingState = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    if (!tr.docChanged && !tr.selection) {
      return deco;
    }

    let decorations: Range<Decoration>[] = [];

    for (const range of tr.state.selection.ranges) {
      if (!range.empty) {
        continue;
      }
      const match = findMatchingBracket(tr.state, range.head);

      if (match) {
        decorations = decorations.concat(
          renderMatch(match[0]),
          renderMatch(match[1]),
        );
      }
    }

    return Decoration.set(decorations, true);
  },
  provide: f => EditorView.decorations.from(f),
});

export const matchingBrackets = [bracketMatchingState];
