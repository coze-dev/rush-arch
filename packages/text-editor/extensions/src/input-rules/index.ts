// modified from closeBrackets extension (from @codemirror/autocomplete)
import { EditorView } from '@codemirror/view';
import { type EditorState, Prec, type Extension } from '@codemirror/state';

interface InputRule {
  type: 'character';
  triggerCharacter: string;
  handler: ({
    view,
    state,
    from,
    to,
  }: {
    view: EditorView;
    state: EditorState;
    from: number;
    to: number;
  }) => boolean;
}

const android =
  typeof navigator === 'object' && /Android\b/.test(navigator.userAgent);

const isExtension = (v: unknown): v is Extension => Boolean(v);
const inputRules = (rules?: InputRule[]) => {
  const ruleExtensions: Extension[] = (rules ?? [])
    .map(({ type, triggerCharacter, handler }) => {
      if (type === 'character') {
        return EditorView.inputHandler.of((view, from, to, insert) => {
          if (
            (android ? view.composing : view.compositionStarted) ||
            view.state.readOnly
          ) {
            return false;
          }
          const sel = view.state.selection.main;
          if (
            insert !== triggerCharacter ||
            from !== sel.from ||
            to !== sel.to
          ) {
            return false;
          }
          return handler({
            view,
            state: view.state,
            from,
            to,
          });
        });
      }
    })
    .filter(v => isExtension(v));

  // give it a higher precedence than default closebrackets extension
  return Prec.high(ruleExtensions);
};

export { inputRules };

export type { InputRule };
