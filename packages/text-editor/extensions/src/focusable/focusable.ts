//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type EditorView, WidgetType, keymap } from '@codemirror/view';

// function blockAt(view: EditorView, pos: number): BlockInfo {
//   const line = view.lineBlockAt(pos)
//   if (Array.isArray(line.type)) for (const l of line.type) {
//     if (l.to > pos || l.to == pos && (l.to == line.to || l.type == BlockType.Text)) return l
//   }
//   return line
// }

const focusableKeymap = keymap.of([
  {
    key: 'ArrowLeft',
    run(view: EditorView) {
      const mainSelection = view.state.selection.main;
      if (!mainSelection.empty) {
        return false;
      }

      let handled = false;
      const pos = mainSelection.from;

      // WHY get widget view directly from view.docView
      // widget has eq method, if eq returns true, new widget will not be applied
      // widget.toDOM will not be called in this case, so widget.focus won't take effect

      // @ts-expect-error docView is not public
      for (const line of view.docView.children) {
        for (const child of line.children) {
          if (
            child.isWidget &&
            child.widget instanceof FocusableWidget &&
            child.posAtEnd === pos
          ) {
            child.widget.focus(1);
            handled = true;
          }
        }

        if (handled) {
          break;
        }
      }
      return handled;
    },
  },
  {
    key: 'ArrowRight',
    run(view: EditorView) {
      const mainSelection = view.state.selection.main;
      if (!mainSelection.empty) {
        return false;
      }

      let handled = false;

      const pos = mainSelection.from;

      // @ts-expect-error docView is not public
      for (const line of view.docView.children) {
        for (const child of line.children) {
          if (
            child.isWidget &&
            child.widget instanceof FocusableWidget &&
            child.posAtStart === pos
          ) {
            child.widget.focus(-1);
            handled = true;
            break;
          }
        }

        if (handled) {
          break;
        }
      }

      return handled;
    },
  },
]);

abstract class FocusableWidget extends WidgetType {
  abstract focus(fromSide: -1 | 1): void;
}

export { focusableKeymap, FocusableWidget };
