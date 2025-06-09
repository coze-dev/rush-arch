//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  type CompletionItem,
  type CompletionList,
  MarkupContent,
  type SignatureHelp,
} from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { type Severity } from '@coze-editor/extension-lint';
import { type Extension, type Text as CMText } from '@codemirror/state';
import { type LRLanguage, type StreamLanguage } from '@codemirror/language';

export interface LanguageConfig {
  language: LRLanguage | StreamLanguage<any>;
  extensions?: Extension[];
  languageService?: LanguageService;
}

export interface CodeAction {
  changes: {
    from: number;
    insert: string;
    to?: number;
  };
}

export interface Link {
  target: string;
  range: {
    from: number;
    to: number;
  };
}

export interface LanguageServiceOptions {
  lintDelay?: number;
}

interface CommonContext {
  textDocument: TextDocument;
}

type ContextWithOffset = CommonContext & {
  offset: number;
};

export enum MarkerTag {
  Unnecessary = 1,
  Deprecated = 2,
}

export { MarkupContent };

interface Diagnostic {
  from: number;
  to: number;
  severity: Severity;
  message: string;
  tags?: MarkerTag[];
}

export { Diagnostic };

interface DefinitionLocation {
  from: number;
  to: number;
}

export interface LanguageService {
  options?: LanguageServiceOptions;
  onTextDocumentDidChange?: (context: CommonContext) => void;
  doValidation?: (context: CommonContext) => Promise<Diagnostic[]>;
  doComplete?: (
    context: ContextWithOffset,
  ) => Promise<CompletionList | null | undefined>;
  resolveCompletionItem?: (
    context: ContextWithOffset,
    entry: CompletionItem,
  ) => Promise<CompletionItem>;
  doHover?: (
    context: ContextWithOffset,
  ) => Promise<MarkupContent | string | undefined>;
  doSignatureHelp?: (
    context: ContextWithOffset,
  ) => Promise<SignatureHelp | null | undefined> | undefined;
  findDefinition?: (
    context: ContextWithOffset,
  ) => Promise<DefinitionLocation[] | null | undefined>;
  findLinks?: (context: CommonContext) => Promise<Link[]>;
  [key: string]: any;
}

// 0-based
export const offsetToPosition = (
  document: CMText,
  offset: number,
): { line: number; character: number } => {
  const line = document.lineAt(offset);
  return {
    line: line.number - 1,
    character: offset - line.from,
  };
};

// 0-based
export const positionToOffset = (
  document: CMText,
  position: { line: number; character: number },
): number | undefined => {
  if (position.line >= document.lines) {
    return undefined;
  }
  const line = document.line(position.line + 1);
  const offset = line.from + position.character;
  if (offset > line.to) {
    return undefined;
  }
  return offset;
};

export {
  uriFacet,
  languageIdFacet,
  transformerFacet,
  textDocumentField,
  type Transformer,
} from './text-document';

export { TextDocument };
