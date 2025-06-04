import { type SyntaxNode } from '@lezer/common';
import { type EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

import { type Scope, type SearchParams, scopeFacet } from './service';

function pathFor(
  read: (node: SyntaxNode) => string,
  member: SyntaxNode,
  query: string,
) {
  const path: string[] = [];
  for (;;) {
    const obj = member.firstChild;
    let prop;
    if (obj?.name == 'VariableName') {
      path.push(read(obj));
      return { paths: path.reverse(), query };
    } else if (
      obj?.name == 'MemberExpression' &&
      (prop = obj.lastChild)?.name == 'PropertyName'
    ) {
      path.push(read(prop!));
      member = obj;
    } else {
      return null;
    }
  }
}

interface CompletionContext {
  state: EditorState;
  pos: number;
  explicit: boolean;
}

const Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;

const dontComplete: string[] = [];

function completionPath(context: CompletionContext): SearchParams | null {
  const read = (node: SyntaxNode) =>
    context.state.doc.sliceString(node.from, node.to);
  const inner = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (inner.name == 'PropertyName') {
    return pathFor(read, inner.parent!, read(inner));
  } else if (
    (inner.name == '.' || inner.name == '?.') &&
    inner.parent!.name == 'MemberExpression'
  ) {
    return pathFor(read, inner.parent!, '');
  } else if (dontComplete.indexOf(inner.name) > -1) {
    return null;
  } else if (
    inner.name == 'VariableName' ||
    (inner.to - inner.from < 20 && Identifier.test(read(inner)))
  ) {
    return { paths: [], query: read(inner) };
  } else if (inner.name == 'MemberExpression') {
    return pathFor(read, inner, '');
  } else {
    return context.explicit ? { paths: [], query: '' } : null;
  }
}

function completion(context: CompletionContext) {
  const scope: Scope | undefined = context.state.facet(scopeFacet);

  if (!scope) {
    return null;
  }

  const path = completionPath(context);

  if (!path) {
    return null;
  }

  const identifiers = scope.search(path);
  if (!identifiers) {
    return null;
  }

  const options = identifiers.map(ident => ({
    label: ident.label,
    apply: ident.label,
  }));

  return {
    from: context.pos - path.query.length,
    options,
    validFor: Identifier,
    filter: true,
  };
}

export { completion };
