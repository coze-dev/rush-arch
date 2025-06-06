import { TextDocument } from 'vscode-languageserver-textdocument';
import { singleton } from '@coze-editor/utils';
import {
  type ASTNode,
  parse,
  findNodeAtOffset,
} from '@coze-editor/parser-json';
import { type EditorState, StateField } from '@codemirror/state';

const field = StateField.define<ASTNode | undefined>({
  create(state) {
    return getAST(state);
  },
  update(value, tr) {
    if (tr.docChanged) {
      return getAST(tr.state);
    }

    return value;
  },
});

function getAST(state: EditorState) {
  const source = state.doc.toString();
  const textDocument = TextDocument.create(
    'file://untitled.json',
    'json',
    1,
    source,
  );
  const { ast } = parse(textDocument, { collectComments: true });
  return ast;
}

export default singleton('cm-extension-json-ast', field);

export { findNodeAtOffset };

export type {
  ASTNode,
  ObjectASTNode,
  PropertyASTNode,
  ArrayASTNode,
  StringASTNode,
  NumberASTNode,
  BooleanASTNode,
  NullASTNode,
} from '@coze-editor/parser-json';
