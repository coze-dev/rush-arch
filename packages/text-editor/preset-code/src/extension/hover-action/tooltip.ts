import { type EditorView, hoverTooltip } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

import { hoverConfigFacet } from './facet';

const getHoverWordPos = (view: EditorView, pos: number) => {
  const { from, to, text } = view.state.doc.lineAt(pos);

  let start = pos;
  let end = pos;
  while (start > from && /\w/.test(text[start - from - 1])) {
    start--;
  }
  while (end < to && /\w/.test(text[end - from])) {
    end++;
  }

  return { start, end };
};

export const wordHover = hoverTooltip((view, pos, side) => {
  const hoverConfig = view.state.facet(hoverConfigFacet);
  const { from, text } = view.state.doc.lineAt(pos);

  const { start, end } = getHoverWordPos(view, pos);

  if ((start === pos && side < 0) || (end === pos && side > 0)) {
    return null;
  }

  return {
    pos: start,
    end,
    above: true,
    create() {
      const textContent = text.slice(start - from, end - from);

      if (hoverConfig.renderPanel) {
        return {
          dom: hoverConfig.renderPanel(textContent, view),
        };
      }

      const dom = document.createElement('div');
      dom.textContent = textContent;
      return { dom };
    },
  };
});

export const jsonLeafNodeHover = hoverTooltip((view, pos) => {
  const { from, text } = view.state.doc.lineAt(pos);

  const hoverConfig = view.state.facet(hoverConfigFacet);

  const tree = syntaxTree(view.state);
  const node = tree.resolveInner(pos);

  if (
    node.prevSibling?.type?.name !== 'PropertyName' ||
    node.type.name !== 'String'
  ) {
    return null;
  }

  const start = node.from;
  const end = node.to;

  return {
    pos: start,
    end,
    above: true,
    create() {
      const textContent = text.slice(start - from + 1, end - from - 1);

      if (hoverConfig.renderPanel) {
        return {
          dom: hoverConfig.renderPanel(textContent, view),
        };
      }

      const dom = document.createElement('div');
      dom.textContent = textContent;
      return { dom };
    },
  };
});
