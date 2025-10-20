//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import ts, {
  type CompletionEntryDetails,
  type CompilerOptions,
  type FormatCodeSettings,
} from 'typescript';
// import lzstring from 'lz-string';
import { expose } from 'comlink';
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
  knownLibFilesForCompilerOptions,
  type VirtualTypeScriptEnvironment,
} from '@typescript/vfs';

import type {
  Diagnostic,
  DiagnosticRelatedInformation,
  InitializeOptions,
  ITypeScriptWorker,
} from './types';
import { libFileMap } from './lib';

class TypeScriptWorker implements ITypeScriptWorker {
  private _env: VirtualTypeScriptEnvironment | null = null;
  private _languageService: ts.LanguageService | null = null;

  private static clearFiles(tsDiagnostics: ts.Diagnostic[]): Diagnostic[] {
    // Clear the `file` field, which cannot be JSON'yfied because it
    // contains cyclic data structures, except for the `fileName`
    // property.
    // Do a deep clone so we don't mutate the ts.Diagnostic object (see https://github.com/microsoft/monaco-editor/issues/2392)
    const diagnostics: Diagnostic[] = [];
    for (const tsDiagnostic of tsDiagnostics) {
      const diagnostic: Diagnostic = { ...tsDiagnostic };
      diagnostic.file = diagnostic.file
        ? { fileName: diagnostic.file.fileName }
        : undefined;
      if (tsDiagnostic.relatedInformation) {
        diagnostic.relatedInformation = [];
        for (const tsRelatedDiagnostic of tsDiagnostic.relatedInformation) {
          const relatedDiagnostic: DiagnosticRelatedInformation = {
            ...tsRelatedDiagnostic,
          };
          relatedDiagnostic.file = relatedDiagnostic.file
            ? { fileName: relatedDiagnostic.file.fileName }
            : undefined;
          diagnostic.relatedInformation.push(relatedDiagnostic);
        }
      }
      diagnostics.push(diagnostic);
    }
    return diagnostics;
  }

  initialize = ({ compilerOptions, initialFiles }: InitializeOptions) => {
    const target = compilerOptions?.target ?? ts.ScriptTarget.ES2020;
    const fsMap = createDefaultFSMap({ target });
    const system = createSystem(fsMap);
    const env = createVirtualTypeScriptEnvironment(
      system,
      [],
      ts,
      compilerOptions,
    );
    this._env = env;
    this._languageService = env.languageService;
    this.syncFiles(initialFiles ?? {});
  };

  private _files = Object.create(null);

  syncFiles(files: Record<string, string>) {
    this._files = Object.assign(this._files, files);

    const env = this._env;
    if (!env) {
      return;
    }

    Object.keys(files).forEach(fileName => {
      const sourceFile = env.getSourceFile(fileName);
      const newContent = files[fileName];

      if (sourceFile && sourceFile.getText() === newContent) {
        return;
      }

      if (sourceFile) {
        env.updateFile(fileName, newContent);
      } else {
        env.createFile(fileName, newContent);
      }
    });
  }

  getSyntacticDiagnostics(fileName: string) {
    const diagnostics =
      this._languageService?.getSyntacticDiagnostics(fileName) ?? [];
    return TypeScriptWorker.clearFiles(diagnostics);
  }

  getSemanticDiagnostics(fileName: string) {
    const diagnostics =
      this._languageService?.getSemanticDiagnostics(fileName) ?? [];
    return TypeScriptWorker.clearFiles(diagnostics);
  }

  getSuggestionDiagnostics(fileName: string) {
    const diagnostics =
      this._languageService?.getSuggestionDiagnostics(fileName) ?? [];
    return TypeScriptWorker.clearFiles(diagnostics);
  }

  getCompletionsAtPosition(fileName: string, position: number) {
    return this._languageService?.getCompletionsAtPosition(
      fileName,
      position,
      undefined,
    );
  }

  getCompletionEntryDetails(
    fileName: string,
    position: number,
    entryName: string,
    formatOptions: FormatCodeSettings | undefined,
    source: string | undefined,
    preferences: ts.UserPreferences | undefined,
    data: ts.CompletionEntryData | undefined,
  ): CompletionEntryDetails | undefined {
    return this._languageService?.getCompletionEntryDetails(
      fileName,
      position,
      entryName,
      formatOptions,
      source,
      preferences,
      data,
    );
  }

  getSignatureHelpItems(
    fileName: string,
    position: number,
    options: ts.SignatureHelpItemsOptions | undefined,
  ) {
    return this._languageService?.getSignatureHelpItems(
      fileName,
      position,
      options,
    );
  }

  getQuickInfoAtPosition(fileName: string, position: number) {
    return this._languageService?.getQuickInfoAtPosition(fileName, position);
  }

  getTypeInfoAtPosition(fileName: string, position: number) {
    const program = this._languageService?.getProgram();
    if (!program) {
      return null;
    }

    const checker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) {
      return null;
    }

    const node = findNodeAtPosition(sourceFile, position);
    if (!node) {
      return null;
    }

    if (node === sourceFile) {
      return null;
    }

    const type = checker.getTypeAtLocation(node);

    if (!type.isClassOrInterface()) {
      return null;
    }

    const typeString = checker.typeToString(type);
    const properties = type.getProperties().map(prop => ({
      name: prop.name,
      type: checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, node)),
    }));

    return { type: typeString, properties };
  }

  getDefinitionAtPosition(fileName: string, position: number) {
    return this._languageService?.getDefinitionAtPosition(fileName, position);
  }

  getFormattingEditsForDocument(fileName: string, options: FormatCodeSettings) {
    return this._languageService?.getFormattingEditsForDocument(
      fileName,
      options,
    );
  }
}

function createDefaultFSMap(options: CompilerOptions) {
  const fsMap = new Map();
  const files = knownLibFilesForCompilerOptions(options, ts);
  files.forEach(file => {
    const content = libFileMap[file];
    if (typeof content === 'string') {
      fsMap.set(`/${file}`, content);
    }
  });
  return fsMap;
}

function findNodeAtPosition(
  sourceFile: ts.SourceFile,
  position: number,
): ts.Node | null {
  function find(node: ts.Node): ts.Node | null {
    if (position >= node.getStart() && position <= node.getEnd()) {
      return ts.forEachChild(node, find) || node;
    }
    return null;
  }
  return find(sourceFile);
}

expose(new TypeScriptWorker());
