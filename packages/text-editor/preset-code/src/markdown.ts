//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import markedShiki from 'marked-shiki';
import { Marked } from 'marked';

import { highlighterPromise } from './highlighter';
import { DEFAULT_SYNTAX_THEME } from './const';

const marked = new Marked()
  .use(
    markedShiki({
      async highlight(code, lang, props) {
        const highlighter = await highlighterPromise;
        return (await highlighter).codeToHtml(code, {
          lang,
          theme: DEFAULT_SYNTAX_THEME,
          transformers: [
            {
              pre(node) {
                delete node.properties.style;
                node.properties.style = 'white-space: pre-wrap;';
              },
            },
          ],
        });
      },
    }),
  )
  .use({
    renderer: {
      link(link) {
        return `<a title="${link.title ?? ''}" target="_blank" href="${link.href}">${link.text}</a>`;
      },
    },
  });

async function renderMarkdown(content: string) {
  return await marked.parse(content);
}

export { renderMarkdown };
