import {
  EditorView,
  Decoration,
  ViewPlugin,
  type ViewUpdate,
  type DecorationSet,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

const DEFAULT_COLORS = ['#ffd700', '#da70d6', '#179fff'];

const ColorizationBracketsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.getBracketDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = this.getBracketDecorations(update.view);
      }
    }

    getBracketDecorations(view: EditorView) {
      const { doc } = view.state;
      const decorations: any[] = [];
      const stack: { type: string; from: number }[] = [];
      const limitNodeType = ['Comment', 'String'];

      const tree = syntaxTree(view.state);

      for (let pos = 0; pos < doc.length; pos += 1) {
        const char = doc.sliceString(pos, pos + 1);
        const node = tree.resolveInner(pos);

        if (limitNodeType.includes(node.type.name)) {
          continue;
        }

        if (char === '(' || char === '[' || char === '{') {
          stack.push({ type: char, from: pos });
        } else if (char === ')' || char === ']' || char === '}') {
          const open = stack.pop();
          if (open && open.type === this.getMatchingBracket(char)) {
            const index = stack.length % 3;
            decorations.push(
              Decoration.mark({ class: `colorization-bracket-${index}` }).range(
                open.from,
                open.from + 1,
              ),
              Decoration.mark({ class: `colorization-bracket-${index}` }).range(
                pos,
                pos + 1,
              ),
            );
          }
        }
      }

      decorations.sort((a, b) => a.from - b.from || a.startSide - b.startSide);

      return Decoration.set(decorations);
    }

    getMatchingBracket(closingBracket: string) {
      switch (closingBracket) {
        case ')':
          return '(';
        case ']':
          return '[';
        case '}':
          return '{';
        default:
          return null;
      }
    }
  },
  {
    decorations: v => v.decorations,
  },
);

export const colorizationBrackets = [
  ColorizationBracketsPlugin,
  EditorView.baseTheme({
    '.colorization-bracket-0': { color: DEFAULT_COLORS[0] },
    '.colorization-bracket-0 > span': { color: DEFAULT_COLORS[0] },
    '.colorization-bracket-1': { color: DEFAULT_COLORS[1] },
    '.colorization-bracket-1 > span': { color: DEFAULT_COLORS[1] },
    '.colorization-bracket-2': { color: DEFAULT_COLORS[2] },
    '.colorization-bracket-2 > span': { color: DEFAULT_COLORS[2] },
  }),
];
