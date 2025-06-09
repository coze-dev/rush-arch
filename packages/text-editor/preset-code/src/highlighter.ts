//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { createHighlighter } from 'shiki';

const highlighterPromise = createHighlighter({
  langs: ['md', 'js', 'ts', 'python'],
  themes: ['github-dark', 'one-dark-pro'],
});

export { highlighterPromise };
