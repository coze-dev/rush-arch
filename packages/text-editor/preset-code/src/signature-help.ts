import {
  MarkupContent,
  type ParameterInformation,
  type SignatureHelp,
} from 'vscode-languageserver-types';
import {
  type Command,
  EditorView,
  type KeyBinding,
  type PluginValue,
  ViewPlugin,
  type ViewUpdate,
  keymap,
  showTooltip,
} from '@codemirror/view';
import {
  type EditorState,
  Facet,
  StateEffect,
  StateField,
} from '@codemirror/state';

import { renderMarkdown } from './markdown';

export const setSignatureHelpRequestPosition = StateEffect.define<number>({});

export const setSignatureHelpResult = StateEffect.define<string | null>({});

class SignatureHelpState {
  pos: number;
  // maybe stale
  result: string | null;

  constructor(pos: number, result: string | null) {
    if (result && pos === -1) {
      throw new Error('Invalid state');
    }
    this.pos = pos;
    this.result = result;
  }
}

const signatureHelpTooltipField: StateField<SignatureHelpState> =
  StateField.define<SignatureHelpState>({
    create: () => new SignatureHelpState(-1, null),
    update(state, tr) {
      let { pos, result } = state;
      for (const effect of tr.effects) {
        if (effect.is(setSignatureHelpRequestPosition)) {
          pos = effect.value;
        } else if (effect.is(setSignatureHelpResult)) {
          result = effect.value;
          if (!result) {
            pos = -1;
          }
        }
      }
      if (pos === -1) {
        result = null;
      }

      pos = pos === -1 ? -1 : tr.changes.mapPos(pos);
      if (state.pos === pos && state.result === result) {
        return state;
      }
      return new SignatureHelpState(pos, result);
    },
    provide: f =>
      showTooltip.compute([f], state => {
        const val = state.field(signatureHelpTooltipField);
        const { result, pos } = val;
        if (result) {
          return {
            pos,
            above: true,
            create: () => {
              const dom = document.createElement('div');
              dom.className = 'cm-signature-tooltip';
              dom.style.cssText = 'font-size: 12px;max-width: 320px;';
              const div = document.createElement('div');
              div.innerHTML = result;
              dom.appendChild(div);
              return { dom };
            },
          };
        }
        return null;
      }),
  });

async function renderSignatureHelp(
  state: EditorState,
  help: SignatureHelp,
): Promise<string | undefined> {
  const {
    signatures,
    activeSignature: activeSignatureIndex,
    activeParameter: activeParameterIndex,
  } = help;

  if (
    typeof activeSignatureIndex !== 'number' ||
    typeof activeParameterIndex !== 'number'
  ) {
    return;
  }

  const activeSignature = signatures[activeSignatureIndex];

  if (!activeSignature || !Array.isArray(activeSignature.parameters)) {
    return;
  }

  const { label } = activeSignature;
  const keyword = getParameterLabel(
    activeSignature.label,
    activeSignature.parameters[activeParameterIndex],
  );
  const documentation: string = MarkupContent.is(activeSignature.documentation)
    ? activeSignature.documentation.value
    : (activeSignature.documentation ?? '');
  const rendered =
    (await renderMarkdown(highlightByKeyword(label, keyword))) +
    (await renderMarkdown(documentation.trim().split('\n')[0]));

  return rendered;
}

function getParameterLabel(fullText: string, parameter?: ParameterInformation) {
  let keyword = parameter?.label ?? '';

  if (Array.isArray(keyword)) {
    const [from, to] = keyword;
    keyword = fullText.slice(from, to);
  }

  return keyword;
}

function highlightByKeyword(content: string, keyword: string): string {
  if (!keyword) {
    return content;
  }
  return content
    .split(keyword)
    .join(`<span class="cm-signature-parameter-active">${keyword}</span>`);
}

const closeSignatureHelp: Command = (view: EditorView) => {
  if (view.state.field(signatureHelpTooltipField).pos !== -1) {
    view.dispatch({
      effects: setSignatureHelpRequestPosition.of(-1),
    });
    return true;
  }
  return false;
};

const signatureHelpKeymap: readonly KeyBinding[] = [
  { key: 'Escape', run: closeSignatureHelp },
];

class SignatureHelpView implements PluginValue {
  constructor(private view: EditorView) {}
  update(update: ViewUpdate) {
    if (
      (update.docChanged || update.selectionSet) &&
      this.view.state.field(signatureHelpTooltipField).pos !== -1
    ) {
      triggerSignatureHelpRequest(this.view, update.state);
    } else if (update.docChanged) {
      const last = update.transactions[update.transactions.length - 1];
      if (last.isUserEvent('input')) {
        update.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
          if (
            inserted.sliceString(0).trim().endsWith('()') ||
            inserted.toString() === ','
          ) {
            triggerSignatureHelpRequest(this.view, update.state);
          }
        });
      }
    }
  }
}

const doSignatureHelpFacet = Facet.define<any, any>({
  combine(values) {
    return values[values.length - 1];
  },
});

const triggerSignatureHelpRequest = async (
  view: EditorView,
  state: EditorState,
): Promise<void> => {
  const doSignatureHelp = state.facet(doSignatureHelpFacet);
  const pos = state.selection.main.from;

  try {
    queueMicrotask(() => {
      view.dispatch({
        effects: [setSignatureHelpRequestPosition.of(pos)],
      });
    });
    const info = await doSignatureHelp(state, pos);

    if (!info || !info.signatures || info.signatures.length === 0) {
      queueMicrotask(() => {
        view.dispatch({
          effects: [setSignatureHelpResult.of(null)],
        });
      });

      return;
    }

    const result = (await renderSignatureHelp(state, info)) ?? '';

    queueMicrotask(() => {
      view.dispatch({
        effects: [setSignatureHelpResult.of(result)],
      });
    });
  } catch (e) {
    queueMicrotask(() => {
      view.dispatch({
        effects: [setSignatureHelpResult.of(null)],
      });
    });
  }
};

const signatureHelpToolTipBaseTheme = EditorView.baseTheme({
  '.cm-tooltip.cm-signature-tooltip': {
    padding: '3px 9px',
    width: 'max-content',
    maxWidth: '500px',
  },
  '.cm-tooltip .cm-signature-parameter-active': {
    fontWeight: 'bold',
  },
});

function signatureHelp(doSignatureHelp: any) {
  return [
    doSignatureHelpFacet.of(doSignatureHelp),
    ViewPlugin.fromClass(SignatureHelpView),
    signatureHelpTooltipField,
    signatureHelpToolTipBaseTheme,
    keymap.of(signatureHelpKeymap),
    EditorView.domEventHandlers({
      blur(event, view) {
        if (
          !(event.relatedTarget instanceof Element) ||
          !event.relatedTarget.closest('.cm-signature-tooltip')
        ) {
          // may be called inside an update
          queueMicrotask(() => {
            view.dispatch({
              effects: setSignatureHelpRequestPosition.of(-1),
            });
          });
        }
      },
    }),
  ];
}

export { signatureHelp };
