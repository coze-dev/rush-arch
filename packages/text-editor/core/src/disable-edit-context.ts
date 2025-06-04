import { EditorView } from '@codemirror/view';

function disableEditContext() {
  (EditorView as any).EDIT_CONTEXT = false;
}

export { disableEditContext };
