import { traverseAST } from '@text-editor/utils';
import { type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { type EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

const astDebugger = ViewPlugin.fromClass(
  class {
    constructor(view: EditorView) {
      printTreeFromState(view.state);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        printTreeFromState(update.state);
      }
    }
  },
);

function printTreeFromState(state: EditorState) {
  const tree = syntaxTree(state);

  console.groupCollapsed('Syntax Tree');

  const cursor = tree.cursor();
  traverseAST(cursor, 0, tree.length, cursor => {
    console.group(
      `%c${cursor.name}(${cursor.from}:${cursor.to})`,
      'color: purple;',
    );

    console.log(state.sliceDoc(cursor.from, cursor.to));
    console.groupEnd();
  });

  console.groupEnd();
}

export { astDebugger };
