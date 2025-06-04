/// Adapted from https://github.com/nota-lang/nota/blob/master/packages/nota-editor/lib/indentation-guides.ts 做了一些调整
import { range } from 'es-toolkit';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

import { getCodeStart, fromPairs } from './utils';

const indentationMark = Decoration.mark({ class: 'cm-indentation-guide' });
const indentationLevelMarks = range(20).map(i =>
  Decoration.line({ class: `cm-indentation-level-${i}` }),
);

class IndentationWidget extends WidgetType {
  constructor(readonly indents: number[]) {
    super();
  }

  static create(indents: number[]) {
    return Decoration.widget({
      widget: new IndentationWidget(indents),
      side: 1,
    });
  }

  toDOM() {
    const wrap = document.createElement('span');
    wrap.className = 'cm-indentation-widget';
    for (const indent of this.indents) {
      const marker = wrap.appendChild(document.createElement('span'));
      marker.className = 'cm-indentation-guide';
      marker.textContent = ' ';
      wrap.append(' '.repeat(indent - 1));
    }
    return wrap;
  }
}

function makeIndentationMark(
  from: number,
  to: number,
  indent: number,
  tabSize: number,
  builder: RangeSetBuilder<Decoration>,
) {
  builder.add(from, from, indentationLevelMarks[indent / tabSize]);
  for (let i = from; i < Math.min(from + indent, to); i += tabSize) {
    builder.add(i, i + 1, indentationMark);
  }
}

function makeIndentationWidget(
  from: number,
  to: number,
  tabSize: number,
  builder: RangeSetBuilder<Decoration>,
) {
  const length = to - from;
  if (length !== 0) {
    return;
  }

  if (tabSize > 2) {
    builder.add(to, to, IndentationWidget.create([tabSize]));
  } else {
    builder.add(to, to, IndentationWidget.create([2, tabSize * 2]));
  }
}

function makeIndentationDecorators(view: EditorView) {
  const builder = new RangeSetBuilder<Decoration>();
  const tabSize = Number(view.state.tabSize);
  const { doc } = view.state;
  const spaceOnlyLines: { from: number; to: number }[] = [];
  let currentIndent = 0;
  for (const { from: visibleFrom, to: visibleTo } of view.visibleRanges) {
    let to = visibleFrom - 1;
    let pos, from, length, text;

    while ((pos = to + 1) <= visibleTo) {
      ({ from, to, length, text } = doc.lineAt(pos));
      const codeStartsAt = getCodeStart(text);
      const isAllSpaces = codeStartsAt === length;
      // we don't have indentation guides for the zero indentation level
      const skipIndent = codeStartsAt === 0;
      const isComment = text[codeStartsAt] === '/';
      if (isAllSpaces) {
        spaceOnlyLines.push({ from, to });
        continue;
      } else if (skipIndent) {
        spaceOnlyLines.length = 0;
        continue;
      }

      const indent = Math.ceil(codeStartsAt / tabSize) * tabSize;

      if (!isComment) {
        currentIndent = indent;
      }

      for (const { from: spaceFrom, to: spaceTo } of spaceOnlyLines) {
        makeIndentationMark(
          spaceFrom,
          spaceTo,
          currentIndent,
          tabSize,
          builder,
        );
        makeIndentationWidget(spaceFrom, spaceTo, tabSize, builder);
      }
      spaceOnlyLines.length = 0;

      makeIndentationMark(from, to, indent, tabSize, builder);
    }
  }
  return builder.finish();
}

const showIndentations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = makeIndentationDecorators(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = makeIndentationDecorators(update.view);
      }
    }
  },
  {
    decorations: v => v.decorations,
  },
);

const indentationTheme = EditorView.baseTheme({
  '.cm-line': {
    paddingLeft: 0,
    marginLeft: '2px',
  },
  '.cm-indentation-guide': {
    position: 'relative',
  },
  '.cm-indentation-guide:after': {
    position: 'absolute',
    content: "''",
    right: '0.9ch',
    height: '1.4em',
    borderLeft: '1px solid rgba(28, 31, 35, .08)',
  },
  ...fromPairs(
    indentationLevelMarks.map((_decoration, i) => [
      `.cm-indentation-level-${i}`,
      { textIndent: `-${i * 2}ch`, paddingLeft: `${i * 2}ch` },
    ]),
  ),
});

export const indentGuides = () => [showIndentations, indentationTheme];
