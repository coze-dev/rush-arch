import {
  type CompletionItemKind,
  type InsertTextFormat,
  MarkupContent,
  type CompletionItem,
} from 'vscode-languageserver-types';
import shiki from 'codemirror-shiki';
import { type Diagnostic, linter } from '@text-editor/extension-lint';
import { type Link, links } from '@text-editor/extension-links';
import {
  type LanguageConfig,
  MarkerTag,
  textDocumentField,
  type LanguageService,
} from '@text-editor/code-language-shared';
import {
  EditorView,
  hoverTooltip,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import {
  EditorSelection,
  type EditorState,
  type Extension,
  StateField,
} from '@codemirror/state';
import { LanguageSupport } from '@codemirror/language';
import {
  autocompletion,
  type Completion,
  insertCompletionText,
  snippet,
} from '@codemirror/autocomplete';

import { signatureHelp } from './signature-help';
import { renderMarkdown } from './markdown';
import { highlighterPromise } from './highlighter';
import gotoDefinition from './goto-definition';
import { DEFAULT_SYNTAX_THEME, LINT_REFRESH_USER_EVENT } from './const';

function formatContents(contents: MarkupContent | string | string[]): string {
  if (MarkupContent.is(contents)) {
    const { value } = contents;
    if (contents.kind === 'markdown') {
      // value = marked.parse(value);
    }
    return value;
  } else if (Array.isArray(contents)) {
    return contents.map(c => `${formatContents(c)}\n\n`).join('');
  } else if (typeof contents === 'string') {
    return contents;
  }

  return '';
}

class LanguagesRegistry {
  private languages: Record<string, LanguageConfig> = {};

  public register(id: string, options: LanguageConfig) {
    if (!this.languages[id]) {
      this.languages[id] = options;
    }

    return () => {
      delete this.languages[id];
    };
  }

  public get(languageId: string): LanguageConfig {
    return this.languages[languageId];
  }

  public getExtension(id: string) {
    if (!this.languages[id]) {
      return [];
    }

    const { languageService, language, extensions } = this.languages[id];

    const langaugeExtensions: Extension[] = [];

    langaugeExtensions.push(new LanguageSupport(language));

    // TODO: use shiki for all languages
    // Only use shiki for TypeScript and Python temporarily
    if (id === 'typescript' || id === 'python') {
      langaugeExtensions.push(
        shiki({
          highlighter: highlighterPromise,
          language: id,
          theme: DEFAULT_SYNTAX_THEME,
        }),
      );
    }

    langaugeExtensions.push(
      StateField.define({
        create(state) {
          if (languageService?.onTextDocumentDidChange) {
            const { textDocument } = state.field(textDocumentField);
            languageService.onTextDocumentDidChange({
              textDocument,
            });
          }
        },
        update(_value, tr) {
          if (tr.docChanged) {
            if (languageService?.onTextDocumentDidChange) {
              const { textDocument } = tr.state.field(textDocumentField);
              languageService.onTextDocumentDidChange({
                textDocument,
              });
            }
          }
        },
      }),
    );

    if (languageService && languageService.doValidation) {
      langaugeExtensions.push(
        ViewPlugin.fromClass(
          class {
            toDispose: (() => void) | undefined;
            constructor(view: EditorView) {
              function onRefreshDiagnostics() {
                view.dispatch({
                  userEvent: LINT_REFRESH_USER_EVENT,
                });
              }

              languageService!.events?.on(
                'refresh-diagnostics',
                onRefreshDiagnostics,
              );

              this.toDispose = () => {
                languageService!.events?.off(
                  'refresh-diagnostics',
                  onRefreshDiagnostics,
                );
              };
            }

            destroy() {
              if (typeof this.toDispose === 'function') {
                this.toDispose();
              }
            }
          },
        ),
        EditorView.theme({
          '.cm-tooltip-lint': {
            maxWidth: '360px',
          },
          '.cm-lint-tag-unnecessary': {
            opacity: '0.5',
          },
          '.cm-lint-tag-deprecated': {
            textDecoration: 'line-through',
          },
          '.cm-lintRange-hint.cm-lint-tag-deprecated': {
            backgroundImage: 'unset',
          },
          '.cm-lintRange-hint.cm-lint-tag-unnecessary': {
            backgroundImage: 'unset',
          },
        }),
      );
      langaugeExtensions.push(
        linter(
          async (view: EditorView) => {
            const { textDocument, originalRangeFor } =
              view.state.field(textDocumentField);
            const diagnostics = await languageService.doValidation!({
              textDocument,
            });

            const finalDiagnostics: Diagnostic[] = diagnostics
              .map(diagnostic => {
                const range = originalRangeFor({
                  from: diagnostic.from,
                  to: diagnostic.to,
                });
                if (range) {
                  let markClass = '';
                  if (diagnostic.tags?.includes(MarkerTag.Unnecessary)) {
                    markClass += 'cm-lint-tag-unnecessary';
                  }
                  if (diagnostic.tags?.includes(MarkerTag.Deprecated)) {
                    markClass += 'cm-lint-tag-deprecated';
                  }
                  return {
                    ...diagnostic,
                    markClass,
                    ...range,
                  };
                }
              })
              .filter(v => isDiagnostic(v));

            languageService.events?.emit('diagnostics', {
              uri: textDocument.uri,
              diagnostics: finalDiagnostics.map(d => ({
                from: d.from,
                to: d.to,
                message: d.message,
                severity: d.severity,
              })),
            });

            return finalDiagnostics;
          },
          {
            delay: languageService.options?.lintDelay ?? 100,
            needsRefresh(update: ViewUpdate) {
              return update.transactions.some(tr =>
                tr.isUserEvent(LINT_REFRESH_USER_EVENT),
              );
            },
          },
        ),
      );
    }

    if (languageService?.doHover) {
      langaugeExtensions.push(
        hoverTooltip(async (view, pos) => {
          const { textDocument, generatedOffsetFor } =
            view.state.field(textDocumentField);
          const offset = generatedOffsetFor(pos);

          if (typeof offset !== 'number') {
            return null;
          }

          const result = await languageService.doHover!({
            textDocument,
            offset,
          });

          if (!result) {
            return null;
          }

          const html = await renderMarkdown(formatContents(result));

          const word = view.state.wordAt(offset);

          return {
            pos: word?.from ?? offset,
            end: word?.to ?? offset,
            create() {
              const dom = document.createElement('div');
              dom.classList.add('cm-code-hover');
              dom.innerHTML = html;

              dom.style.cssText = 'padding: 5px 10px;max-width: 360px;';
              return {
                dom,
              };
            },
          };
        }),
        EditorView.theme({
          '.cm-code-hover a': {
            color: '#3b98ff',
          },
          '.cm-code-hover pre': {
            margin: '0',
          },
        }),
      );
    }

    if (languageService?.doSignatureHelp) {
      langaugeExtensions.push(
        signatureHelp(async (state: EditorState, pos: number) => {
          const { textDocument, generatedRangeFor } =
            state.field(textDocumentField);
          const range = generatedRangeFor({ from: pos, to: pos });
          const offset = range?.from;

          if (typeof offset !== 'number') {
            return null;
          }

          const result = await languageService.doSignatureHelp!({
            textDocument,
            offset,
          });

          return result;
        }),
      );
    }

    if (languageService?.doComplete) {
      langaugeExtensions.push(
        autocompletion({
          override: [
            async function ({ state, pos, view }) {
              const { textDocument, originalRangeFor, generatedRangeFor } =
                state.field(textDocumentField);
              const range = generatedRangeFor({ from: pos, to: pos });
              const offset = range?.from;

              if (typeof offset !== 'number') {
                return null;
              }

              const completionResult = await languageService.doComplete!({
                textDocument,
                offset,
              });

              if (
                !completionResult ||
                !Array.isArray(completionResult.items) ||
                completionResult.items.length === 0
              ) {
                return null;
              }

              const completionOptions: Completion[] = [];

              const mapping = new WeakMap();
              const resolveCompletion = createResolveCompletion(
                view,
                languageService,
                mapping,
              );

              for (const item of completionResult.items) {
                const { kind, label, textEdit, textEditText } = item;

                const completion: Completion = {
                  label,
                  type: defaultFromCompletionItemKind(kind),
                  detail: item.detail ?? '',
                };

                mapping.set(completion, item);

                if (textEdit) {
                  const range =
                    'range' in textEdit ? textEdit.range : textEdit.replace;
                  const from = textDocument.offsetAt(range.start);
                  const to = textDocument.offsetAt(range.end);

                  const oRange = originalRangeFor({
                    from,
                    to,
                  });

                  if (!oRange) {
                    continue;
                  }

                  const insert = textEdit.newText;
                  const { insertTextFormat } = item;

                  completion.apply = view => {
                    // TODO: move to preset code
                    if (
                      insertTextFormat ===
                      (2 satisfies typeof InsertTextFormat.Snippet)
                    ) {
                      snippet(
                        addAnchor(
                          insert
                            .replace(/\$(\d+)/g, '$${$1}')
                            .replace(/\\\$/g, '$'),
                        ),
                      )(view, completion, oRange.from, oRange.to);
                    } else {
                      view.dispatch(
                        insertCompletionText(
                          view.state,
                          insert,
                          oRange.from,
                          oRange.to,
                        ),
                      );
                    }
                  };
                } else if (textEditText) {
                  completion.apply = textEditText;
                }

                completion.info = resolveCompletion;

                completionOptions.push(completion);
              }

              return {
                from: pos,
                options: completionOptions,
                filter: false,
              };
            },
          ],
        }),
      );
    }

    if (languageService?.findDefinition) {
      langaugeExtensions.push(
        gotoDefinition(async ({ pos, view }) => {
          const { textDocument, originalRangeFor, generatedRangeFor } =
            view.state.field(textDocumentField);
          const range = generatedRangeFor({ from: pos, to: pos });
          const offset = range?.from;

          if (typeof offset !== 'number') {
            return null;
          }

          const definitions = await languageService.findDefinition!({
            textDocument,
            offset,
          });

          if (!Array.isArray(definitions) || definitions.length === 0) {
            return;
          }

          const definition = definitions[0];

          const oRange = originalRangeFor({
            from: definition.from,
            to: definition.to,
          });

          if (!oRange) {
            return;
          }

          view.dispatch({
            effects: EditorView.scrollIntoView(oRange.from, {
              y: 'center',
            }),
            selection: EditorSelection.range(oRange.from, oRange.to),
          });
        }),
      );
    }

    if (languageService?.findLinks) {
      langaugeExtensions.push(
        links(async view => {
          const { textDocument, originalRangeFor } =
            view.state.field(textDocumentField);
          const links = await languageService.findLinks!({
            textDocument,
          });

          return links
            .map(link => {
              const range = originalRangeFor(link.range);
              if (!range) {
                return;
              }
              return {
                range,
                target: link.target,
              };
            })
            .filter(v => isLink(v));
        }),
      );
    }

    if (extensions) {
      langaugeExtensions.push(extensions);
    }

    return langaugeExtensions;
  }
}

function createResolveCompletion(
  view: EditorView | undefined,
  languageService: LanguageService,
  mapping: WeakMap<Completion, CompletionItem>,
) {
  const dom = document.createElement('div');
  let controller = new AbortController();

  function hideDOM(controller: AbortController) {
    if (!controller.signal.aborted) {
      dom.style.display = 'none';
    }
  }

  function showDOM(html: string, controller: AbortController) {
    if (!controller.signal.aborted) {
      dom.innerHTML = html;
      dom.style.display = 'block';
    }
  }

  return (completion: Completion) => {
    controller.abort();
    controller = new AbortController();

    const closureController = controller;

    (async () => {
      const completionItem = mapping.get(completion);
      if (
        !view ||
        !completionItem ||
        typeof languageService.resolveCompletionItem !== 'function'
      ) {
        hideDOM(closureController);
        return;
      }

      const { textDocument, originalRangeFor } =
        view.state.field(textDocumentField);

      const oRange = originalRangeFor({
        from: view.state.selection.main.from,
        to: view.state.selection.main.from,
      });

      if (!oRange) {
        hideDOM(closureController);
        return;
      }

      const details = await languageService.resolveCompletionItem(
        {
          textDocument,
          offset: oRange.from,
        },
        completionItem,
      );

      if (!details.detail && !details.documentation) {
        hideDOM(closureController);
        return;
      }

      const documentationString = MarkupContent.is(details.documentation)
        ? await renderMarkdown(details.documentation.value)
        : (details.documentation ?? '');

      const html = [
        `<div style="opacity: 0.8;white-space: pre-wrap;">${
          details.detail ?? ''
        }</div>`,
        details.documentation ? '<br />' : '',
        `<div>${documentationString}</div>`,
      ].join('');

      if (!closureController.signal.aborted) {
        showDOM(html, closureController);
      }
    })();

    return dom;
  };
}

function isDiagnostic(v: unknown): v is Diagnostic {
  return Boolean(v);
}

function isLink(v: unknown): v is Link {
  return Boolean(v);
}

function addAnchor(str: string) {
  if (!str.includes('${')) {
    return `${str}\${0}`;
  }

  return str;
}

function defaultFromCompletionItemKind(
  kind: CompletionItemKind | undefined,
): string {
  switch (kind) {
    case 1 satisfies typeof CompletionItemKind.Text:
      return 'text';

    case 15 satisfies typeof CompletionItemKind.Snippet:
      return 'snippet';

    case 2 satisfies typeof CompletionItemKind.Method:
      return 'method';

    case 3 satisfies typeof CompletionItemKind.Function:
      return 'function';

    case 4 satisfies typeof CompletionItemKind.Constructor:
      return 'constructor';

    case 7 satisfies typeof CompletionItemKind.Class:
      return 'class';

    case 5 satisfies typeof CompletionItemKind.Field:
      return 'field';

    case 10 satisfies typeof CompletionItemKind.Property:
      return 'property';

    case 6 satisfies typeof CompletionItemKind.Variable:
      return 'variable';

    case 18 satisfies typeof CompletionItemKind.Reference:
      return 'reference';

    case 23 satisfies typeof CompletionItemKind.Event:
      return 'event';

    case 8 satisfies typeof CompletionItemKind.Interface:
      return 'interface';

    case 22 satisfies typeof CompletionItemKind.Struct:
      return 'struct';

    case 25 satisfies typeof CompletionItemKind.TypeParameter:
      return 'typeParameter';

    case 9 satisfies typeof CompletionItemKind.Module:
      return 'module';

    case 12 satisfies typeof CompletionItemKind.Value:
      return 'value';

    case 13 satisfies typeof CompletionItemKind.Enum:
    case 20 satisfies typeof CompletionItemKind.EnumMember:
      return 'enum';

    case 11 satisfies typeof CompletionItemKind.Unit:
      return 'unit';

    case 14 satisfies typeof CompletionItemKind.Keyword:
      return 'keyword';

    case 24 satisfies typeof CompletionItemKind.Operator:
      return 'operator';

    case 16 satisfies typeof CompletionItemKind.Color:
      return 'color';

    case 21 satisfies typeof CompletionItemKind.Constant:
      return 'constant';

    default:
      return 'value';
  }
}

export const languages = new LanguagesRegistry();
