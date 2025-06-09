//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { TextDocument } from 'vscode-languageserver-textdocument';
import { FacetCombineStrategy } from '@coze-editor/utils';
import { type EditorState, Facet, StateField } from '@codemirror/state';

interface Range {
  from: number;
  to: number;
}
interface Mapping {
  originalRangeFor: (range: Range) => Range | undefined;
  generatedRangeFor: (range: Range) => Range | undefined;
  originalOffsetFor: (offset: number) => number | undefined;
  generatedOffsetFor: (offset: number) => number | undefined;
}
type Transformer = (text: string) => {
  code: string;
  mapping: Mapping;
};

const transformerFacet = Facet.define<Transformer, Transformer>({
  combine: FacetCombineStrategy.Last,
});

const uriFacet = Facet.define<string, string>({
  combine: FacetCombineStrategy.Last,
});

const languageIdFacet = Facet.define<string, string>({
  combine: FacetCombineStrategy.Last,
});

function identical<T>(value: T): T {
  return value;
}

type TextDocumentWithMapping = {
  textDocument: TextDocument;
} & Mapping;

function transform(
  oldDocument: TextDocument | null,
  state: EditorState,
): TextDocumentWithMapping {
  const uri = getURI(state);
  const languageId = getLanguageId(state);
  const transformer = state.facet(transformerFacet);
  const version = oldDocument ? oldDocument.version + 1 : 0;

  if (typeof transformer === 'function') {
    const { code, mapping } = transformer(state.doc.toString());

    return {
      textDocument: TextDocument.create(uri, languageId, version, code),
      originalRangeFor: (range: Range) => mapping.originalRangeFor(range),
      generatedRangeFor: (range: Range) => mapping.generatedRangeFor(range),
      originalOffsetFor: (offset: number) => mapping.originalOffsetFor(offset),
      generatedOffsetFor: (offset: number) =>
        mapping.generatedOffsetFor(offset),
    };
  }

  return {
    textDocument: TextDocument.create(
      uri,
      languageId,
      version,
      state.doc.toString(),
    ),
    originalRangeFor: identical<Range>,
    generatedRangeFor: identical<Range>,
    originalOffsetFor: identical<number>,
    generatedOffsetFor: identical<number>,
  };
}

const textDocumentField = StateField.define<TextDocumentWithMapping>({
  create(state) {
    return transform(null, state);
  },
  update(document, tr) {
    if (tr.docChanged) {
      return transform(document.textDocument, tr.state);
    }

    return document;
  },
});

function getURI(state: EditorState) {
  return state.facet(uriFacet);
}

function getLanguageId(state: EditorState) {
  return state.facet(languageIdFacet) ?? 'unknown';
}

export {
  uriFacet,
  languageIdFacet,
  transformerFacet,
  textDocumentField,
  type Transformer,
};
