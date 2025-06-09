//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  type CompletionEntryDetails,
  type CompilerOptions,
  type FormatCodeSettings,
  type TextChange,
} from 'typescript';
import type ts from 'typescript';

export interface InitializeOptions {
  compilerOptions?: CompilerOptions;
  initialFiles?: Record<string, string>;
}

/**
 * A linked list of formatted diagnostic messages to be used as part of a multiline message.
 * It is built from the bottom up, leaving the head to be the "main" diagnostic.
 */
export interface DiagnosticMessageChain {
  messageText: string;
  /** Diagnostic category: warning = 0, error = 1, suggestion = 2, message = 3 */
  category: 0 | 1 | 2 | 3;
  code: number;
  next?: DiagnosticMessageChain[];
}
export interface Diagnostic extends DiagnosticRelatedInformation {
  /** May store more in future. For now, this will simply be `true` to indicate when a diagnostic is an unused-identifier diagnostic. */
  reportsUnnecessary?: {};
  reportsDeprecated?: {};
  source?: string;
  relatedInformation?: DiagnosticRelatedInformation[];
}
export interface DiagnosticRelatedInformation {
  /** Diagnostic category: warning = 0, error = 1, suggestion = 2, message = 3 */
  category: 0 | 1 | 2 | 3;
  code: number;
  /** TypeScriptWorker removes all but the `fileName` property to avoid serializing circular JSON structures. */
  file: { fileName: string } | undefined;
  start: number | undefined;
  length: number | undefined;
  messageText: string | DiagnosticMessageChain;
}

export interface ITypeScriptWorker {
  initialize: ({ compilerOptions, initialFiles }: InitializeOptions) => void;

  syncFiles: (files: Record<string, string>) => void;

  getSyntacticDiagnostics: (fileName: string) => Diagnostic[];

  getSemanticDiagnostics: (fileName: string) => Diagnostic[];

  getSuggestionDiagnostics: (fileName: string) => Diagnostic[];

  getCompletionsAtPosition: (
    fileName: string,
    position: number,
  ) => ts.CompletionInfo | undefined;

  getCompletionEntryDetails: (
    fileName: string,
    position: number,
    entryName: string,
    formatOptions: FormatCodeSettings | undefined,
    source: string | undefined,
    preferences: ts.UserPreferences | undefined,
    data: ts.CompletionEntryData | undefined,
  ) => CompletionEntryDetails | undefined;

  getSignatureHelpItems: (
    fileName: string,
    position: number,
    options: ts.SignatureHelpItemsOptions | undefined,
  ) => ts.SignatureHelpItems | undefined;

  getQuickInfoAtPosition: (
    fileName: string,
    position: number,
  ) => ts.QuickInfo | undefined;

  getDefinitionAtPosition: (
    fileName: string,
    position: number,
  ) => ReadonlyArray<ts.DefinitionInfo> | undefined;

  getFormattingEditsForDocument: (
    fileName: string,
    options: FormatCodeSettings,
  ) => TextChange[] | undefined;

  getTypeInfoAtPosition: (
    fileName: string,
    position: number,
  ) => {
    type: string;
    properties: {
      name: string;
      type: string;
    }[];
  } | null;
}
