//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { FacetCombineStrategy } from '@coze-editor/utils';
import { Facet } from '@codemirror/state';

type Identifier = VariableIdentifier | FieldIdentifier | FunctionIdentifier;

enum IdentifierKind {
  Variable,
  Function,
  Field,
}

interface VariableIdentifier {
  kind: IdentifierKind.Variable;
  label: string;
  dataType: string;
}

interface FieldIdentifier {
  kind: IdentifierKind.Field;
  label: string;
  dataType: string;
}

interface FunctionIdentifier {
  kind: IdentifierKind.Function;
  label: string;
}

interface SearchParams {
  paths: string[];
  query: string;
}

interface Scope {
  search: (search: SearchParams) => readonly Identifier[];
}

const scopeFacet = Facet.define<Scope, Scope>({
  combine: FacetCombineStrategy.Last,
});

export { scopeFacet, IdentifierKind };

export type { Scope, SearchParams };
