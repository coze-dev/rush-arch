//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import { createHighlighterCore } from 'shiki/core';

// const highlighterPromise = createHighlighter({
//   langs: ['md', 'js', 'ts', 'python'],
//   themes: ['github-dark', 'one-dark-pro'],
// });

const highlighterPromise = createHighlighterCore({
  langs: [
    () => import('@shikijs/langs/markdown'),
    () => import('@shikijs/langs/javascript'),
    () => import('@shikijs/langs/typescript'),
    () => import('@shikijs/langs/python'),
    () => import('@shikijs/langs/sql'),
  ],
  themes: [
    () => import('@shikijs/themes/github-dark'),
    () => import('@shikijs/themes/one-dark-pro'),
  ],
  engine: createOnigurumaEngine(import('shiki/wasm')),
});

export { highlighterPromise };
