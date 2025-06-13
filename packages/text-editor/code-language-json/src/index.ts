//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { URI } from 'vscode-uri';
import {
  getLanguageService,
  TextDocument,
  type LanguageService,
  type JSONSchema,
  type CompletionList,
  type JSONDocument,
  DiagnosticSeverity,
} from 'vscode-json-languageservice';
import { Text } from 'text-mapping';
import { v4 as uuid } from '@lukeed/uuid';
import { parse } from '@coze-editor/parser-json';
import {
  type LanguageService as ILanguageService,
  type LanguageServiceOptions,
  type Link,
  textDocumentField,
} from '@coze-editor/code-language-shared';
import {
  type ChangeSpec,
  type EditorState,
  type TransactionSpec,
} from '@codemirror/state';

import { jsonLanguage } from './json';

interface SchemasConfiguration {
  uri: string;
  fileMatch: string[];
  schema: JSONSchema;
}

interface ValidateOptions {
  schema?: JSONSchema;
  transform?: (text: Text) => Text;
}

function normalizeId(id: string) {
  // remove trailing '#', normalize drive capitalization
  try {
    return URI.parse(id).toString(true);
  } catch (e) {
    return id;
  }
}

function isNonNull<T>(value: T | undefined): value is T {
  return Boolean(value);
}

const urlReg = /^(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?$/i;

class JSONLanguageService implements ILanguageService {
  protected languageService: LanguageService;
  private schemasConfigurations: SchemasConfiguration[] = [];
  public triggerCharacters = [':', '"', "'"];

  constructor(public options: LanguageServiceOptions) {
    this.languageService = getLanguageService({});
    this.configure();
  }

  private configure() {
    this.languageService.configure({
      allowComments: false,
      schemas: this.schemasConfigurations.map(e => ({
        fileMatch: e.fileMatch,
        uri: normalizeId(e.uri),
        schema: e.schema,
      })),
    });
  }

  private parseJSONDocument(
    textDocument: TextDocument,
  ): JSONDocument | undefined {
    const text = parse(textDocument, { collectComments: true });
    if (!text.ast) {
      return;
    }

    const jsonDocument = this.languageService.newJSONDocument(
      text.ast,
      text.problems,
    );
    // @ts-expect-error comments type is not exported
    jsonDocument.comments = text.commentRanges;
    return jsonDocument;
  }

  public async validate(source: string, options?: ValidateOptions) {
    let text = new Text(source);

    if (typeof options?.transform === 'function') {
      text = options.transform(text);
    }

    const textDocument = TextDocument.create(
      `file:///anonymous-${uuid()}.json`,
      'json',
      0,
      text.toString(),
    );
    const jsonDocument = this.parseJSONDocument(textDocument);

    if (!jsonDocument) {
      return [];
    }

    const diagnostics = await this.languageService.doValidation(
      textDocument,
      jsonDocument,
      {},
      options?.schema,
    );

    return diagnostics
      .map(e => {
        const from = textDocument.offsetAt(e.range.start);
        const to = textDocument.offsetAt(e.range.end);

        return {
          from,
          to,
          severity: e.severity,
          message: e.message,
        };
      })
      .map(e => {
        const oRange = text.originalRangeFor({
          from: e.from,
          to: e.to,
        });
        if (!oRange) {
          return;
        }
        return {
          ...e,
          ...oRange,
        };
      })
      .filter(isNonNull);
  }

  public configureSchemas(
    config: SchemasConfiguration | SchemasConfiguration[],
  ) {
    let configs: SchemasConfiguration[] = [];
    configs = configs.concat(config);

    configs.forEach(c => {
      const match = this.schemasConfigurations.find(e => e.uri === c.uri);
      if (match) {
        match.schema = c.schema;
        match.fileMatch = c.fileMatch;
      } else {
        this.schemasConfigurations.push(c);
      }
    });

    this.configure();
  }

  public deleteSchemas(uri: string | string[]) {
    let allURI: string[] = [];
    allURI = allURI.concat(uri);

    this.schemasConfigurations = this.schemasConfigurations.filter(
      c => !allURI.includes(c.uri),
    );

    this.configure();
  }

  public async doValidation(
    context: Parameters<NonNullable<ILanguageService['doValidation']>>[0],
  ) {
    const { textDocument } = context;
    const jsonDocument = this.parseJSONDocument(textDocument);

    if (!jsonDocument) {
      return [];
    }

    const diagnostics = await this.languageService.doValidation(
      textDocument,
      jsonDocument,
    );

    return diagnostics.map(e => {
      const from = textDocument.offsetAt(e.range.start);
      const to = textDocument.offsetAt(e.range.end);

      return {
        from,
        to,
        severity: 'error' as const,
        message: e.message,
      };
    });
  }

  async format(
    state: EditorState,
    options?: { tabSize: number },
  ): Promise<TransactionSpec> {
    const { textDocument, originalRangeFor } = state.field(textDocumentField);

    const edits = this.languageService.format(
      textDocument,
      // @ts-expect-error range can be undefined
      undefined,
      {
        tabSize: options?.tabSize ?? 4,
        insertSpaces: true,
        insertFinalNewline: false,
      },
    );

    const changes = edits
      .map(edit => {
        const range = originalRangeFor({
          from: textDocument.offsetAt(edit.range.start),
          to: textDocument.offsetAt(edit.range.end),
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

  public async doComplete(
    context: Parameters<NonNullable<ILanguageService['doComplete']>>[0],
  ): Promise<CompletionList | null | undefined> {
    const { textDocument } = context;
    const { offset } = context;

    const { line, character } = textDocument.positionAt(offset);

    const jsonDocument = this.parseJSONDocument(textDocument);

    if (!jsonDocument) {
      return;
    }

    const completionResult = await this.languageService.doComplete(
      textDocument,
      {
        line,
        character,
      },
      jsonDocument,
    );

    if (!completionResult || !completionResult.items.length) {
      return;
    }

    return {
      isIncomplete: true,
      items: completionResult.items,
    };
  }

  async findLinks(
    context: Parameters<NonNullable<ILanguageService['findLinks']>>[0],
  ) {
    const { textDocument } = context;
    const doc = this.parseJSONDocument(textDocument);

    if (!doc) {
      return [];
    }

    const links: Link[] = [];

    // @ts-expect-error doc.visit is not exposed but indeed exists
    doc.visit(node => {
      if (node.type === 'string' && urlReg.test(node.value)) {
        const range = {
          from: node.offset + 1,
          to: node.offset + node.length - 1,
        };

        links.push({
          target: node.value,
          range,
        });
      }
      return true;
    });

    return links;
  }
}

function isChangeDesc(v: unknown): v is ChangeSpec {
  return Boolean(v);
}

const jsonLanguageService = new JSONLanguageService({
  lintDelay: 0,
});

const json = {
  language: jsonLanguage,
  languageService: jsonLanguageService,
};

export { json, jsonLanguage, jsonLanguageService, JSONLanguageService };

export { DiagnosticSeverity, Text };
