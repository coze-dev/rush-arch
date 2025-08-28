//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { URI } from 'vscode-uri';
import {
  type CompletionItem,
  MarkupKind,
  type ParameterInformation,
  type SignatureHelp,
  type SignatureInformation,
} from 'vscode-languageserver-types';
import {
  type CompletionEntryDetails,
  type FormatCodeSettings,
} from 'typescript';
import mitt from 'mitt';
import { type Remote, wrap } from 'comlink';
import {
  type Diagnostic,
  type LanguageService as ILanguageService,
  MarkerTag,
  textDocumentField,
} from '@coze-editor/code-language-shared';
import type {
  ChangeSpec,
  EditorState,
  TransactionSpec,
} from '@codemirror/state';

import { DiagnosticCategory, displayPartsToString, tagToString } from './utils';
import type { InitializeOptions, ITypeScriptWorker } from './types';
import { asCompletionItemKind } from './as';

function isDiagnostic(v: unknown): v is Diagnostic {
  return Boolean(v);
}

function isChangeDesc(v: unknown): v is ChangeSpec {
  return Boolean(v);
}

type Severity = 'hint' | 'info' | 'warning' | 'error';

type Events = {
  diagnostics: {
    uri: string;
    diagnostics: {
      from: number;
      to: number;
      message: string;
      severity: Severity;
    }[];
  };
  'refresh-diagnostics': void;
};

class TypeScriptLanguageService implements ILanguageService {
  private worker: Remote<ITypeScriptWorker> | null = null;
  private starting: Promise<unknown> | null = null;
  private _cachedFiles: Record<string, string> = Object.create(null);
  public events = mitt<Events>();
  public triggerCharacters: string[] = ['.', "'", '"'];

  private async synchronize(paths: string[]) {
    await this.starting;

    if (!this.worker) {
      throw new Error('TypeScript LanguageService is not initialized');
    }

    const files: Record<string, string> = {};
    paths.forEach(path => {
      files[path] = this._cachedFiles[path] ?? '';
    });
    await this.worker.syncFiles(files);

    return this.worker;
  }

  onTextDocumentDidChange = (ctx: any) => {
    const { textDocument } = ctx;
    const text = textDocument.getText();
    const uri = URI.parse(textDocument.uri);
    const path = uri.fsPath;
    this._cachedFiles[path] = text;
  };

  doHover: NonNullable<ILanguageService['doHover']> = async ctx => {
    const { textDocument } = ctx;

    const uri = URI.parse(textDocument.uri);
    const path = uri.fsPath;

    const worker = await this.synchronize([path]);

    const info = await worker.getQuickInfoAtPosition(path, ctx.offset);

    if (!info) {
      return;
    }

    const tags = info.tags
      ? info.tags.map(tag => tagToString(tag)).join('  \n\n')
      : '';
    const contents = displayPartsToString(info.displayParts);
    const documentation = displayPartsToString(info.documentation);

    return {
      kind: MarkupKind.Markdown,
      value: `\`\`\`ts\n${contents}\n\`\`\`\n${
        documentation
      }${tags ? `\n\n${tags}` : ''}`,
    };
  };

  public async synchronizeByURI(uri: string, content: string) {
    await this.onTextDocumentDidChange({
      textDocument: {
        uri,
        getText() {
          return content;
        },
      },
    });
  }

  public async validateByURI(uri: string) {
    return this.doValidation({
      textDocument: {
        uri,
      } as any,
    });
  }

  doValidation: NonNullable<ILanguageService['doValidation']> = async ctx => {
    const { textDocument } = ctx;

    const uri = URI.parse(textDocument.uri);
    const path = uri.fsPath;

    const worker = await this.synchronize([path]);

    try {
      const diagnostics = [
        ...(await worker.getSyntacticDiagnostics(path)),
        ...(await worker.getSemanticDiagnostics(path)),
        ...(await worker.getSuggestionDiagnostics(path)),
      ];

      const categoryToSeverityMap = {
        [DiagnosticCategory.Error]: 'error',
        [DiagnosticCategory.Warning]: 'warning',
        [DiagnosticCategory.Message]: 'info',
        [DiagnosticCategory.Suggestion]: 'hint',
      };

      return diagnostics
        .map(d => {
          if (
            typeof d.start !== 'number' ||
            !categoryToSeverityMap[d.category]
          ) {
            return;
          }

          const tags: MarkerTag[] = [];
          if (d.reportsUnnecessary) {
            tags.push(MarkerTag.Unnecessary);
          }
          if (d.reportsDeprecated) {
            tags.push(MarkerTag.Deprecated);
          }

          return {
            from: d.start,
            to: d.start + (d.length ?? 0),
            severity: categoryToSeverityMap[d.category],
            message:
              typeof d.messageText === 'string'
                ? d.messageText
                : d.messageText.messageText,
            tags,
          };
        })
        .filter(v => isDiagnostic(v));
    } catch (e) {
      return [];
    }
  };

  doComplete: ILanguageService['doComplete'] = async ctx => {
    const uri = URI.parse(ctx.textDocument.uri);
    const path = uri.fsPath;

    const worker = await this.synchronize([path]);

    const result = await worker.getCompletionsAtPosition(path, ctx.offset);

    if (!result) {
      return null;
    }

    const items = result.entries.map(entry => ({
      label: entry.name,
      kind: asCompletionItemKind(entry.kind),
    }));

    return {
      isIncomplete: result.isIncomplete ?? true,
      items,
    };
  };

  public async resolveCompletionItem(
    ctx: any,
    item: CompletionItem,
  ): Promise<CompletionItem> {
    const uri = URI.parse(ctx.textDocument.uri);
    const path = uri.fsPath;
    const worker = await this.synchronize([path]);
    const details = await worker.getCompletionEntryDetails(
      path,
      ctx.offset,
      item.label,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    if (!details) {
      return item;
    }
    const documentationString = createDocumentationString(details);
    return {
      label: details.name,
      detail: displayPartsToString(details?.displayParts),
      documentation: documentationString
        ? {
            kind: MarkupKind.Markdown,
            value: documentationString,
          }
        : undefined,
    };
  }

  public async format(
    state: EditorState,
    options: FormatCodeSettings = {},
  ): Promise<TransactionSpec> {
    const { textDocument, originalRangeFor } = state.field(textDocumentField);

    const uri = URI.parse(textDocument.uri);
    const path = uri.fsPath;

    const worker = await this.synchronize([path]);

    const edits = await worker.getFormattingEditsForDocument(path, {
      indentSize: 2,
      tabSize: 2,
      convertTabsToSpaces: true,
      newLineCharacter: '\n',
      ...options,
    });

    if (!edits) {
      return {
        changes: [],
      };
    }

    const changes = edits
      .map(edit => {
        const range = originalRangeFor({
          from: edit.span.start,
          to: edit.span.start + edit.span.length,
        });
        if (range) {
          return {
            ...range,
            insert: edit.newText,
          };
        }
      })
      .filter(v => isChangeDesc(v));

    return {
      changes,
    };
  }

  async getTypeInformation(ctx: any) {
    const { textDocument } = ctx;

    const uri = URI.parse(textDocument.uri);
    const path = uri.fsPath;

    const worker = await this.synchronize([path]);

    const info = await worker.getTypeInfoAtPosition(path, ctx.offset);

    return info;
  }

  async doSignatureHelp(ctx: any) {
    const uri = URI.parse(ctx.textDocument.uri);
    const path = uri.fsPath;

    const worker = await this.synchronize([path]);

    const info = await worker.getSignatureHelpItems(path, ctx.offset, {});

    if (!info) {
      return null;
    }

    const ret: SignatureHelp = {
      activeSignature: info.selectedItemIndex,
      activeParameter: info.argumentIndex,
      signatures: [],
    };

    info.items.forEach(item => {
      const signature: SignatureInformation = {
        label: '',
        parameters: [],
      };

      signature.documentation = {
        kind: MarkupKind.Markdown,
        value: displayPartsToString(item.documentation),
      };
      signature.label += displayPartsToString(item.prefixDisplayParts);
      item.parameters.forEach((p, i, a) => {
        const label = displayPartsToString(p.displayParts);
        const parameter: ParameterInformation = {
          label,
          documentation: {
            kind: MarkupKind.Markdown,
            value: displayPartsToString(p.documentation),
          },
        };
        signature.label += label;
        signature.parameters!.push(parameter);
        if (i < a.length - 1) {
          signature.label += displayPartsToString(item.separatorDisplayParts);
        }
      });
      signature.label += displayPartsToString(item.suffixDisplayParts);
      ret.signatures.push(signature);
    });

    return ret;
  }

  // async findDefinition(ctx) {
  //   const uri = URI.parse(ctx.textDocument.uri)
  //   const path = uri.fsPath

  //   const worker = await this.synchronize([path])

  //   const info = await worker.getDefinitionAtPosition(path, ctx.offset)

  //   if (!info) {
  //     return
  //   }

  //   return info.map(def => {
  //     return {
  //       from: def.textSpan.start,
  //       to: def.textSpan.start + def.textSpan.length,
  //     }
  //   })
  // }

  public initialize(tsWorker: Worker, options?: InitializeOptions) {
    this.worker = wrap<ITypeScriptWorker>(tsWorker);
    this.starting = this.worker.initialize({
      compilerOptions: options?.compilerOptions ?? {},
      initialFiles: {
        ...this.extraFiles,
        ...(options?.initialFiles ?? {}),
      },
    });
  }

  private extraFiles: Record<string, string> = Object.create(null);

  public async addExtraFiles(files: Record<string, string>) {
    this.extraFiles = Object.assign({}, this.extraFiles, files);

    await this.starting;
    if (this.worker) {
      await this.worker.syncFiles(files);
      this.events.emit('refresh-diagnostics');
    }
  }
}

function createDocumentationString(details: CompletionEntryDetails): string {
  let documentationString = displayPartsToString(details.documentation);
  if (details.tags) {
    for (const tag of details.tags) {
      documentationString += `\n\n${tagToString(tag)}`;
    }
  }
  return documentationString;
}

const typescriptLanguageService = new TypeScriptLanguageService();

export { TypeScriptLanguageService, typescriptLanguageService };
