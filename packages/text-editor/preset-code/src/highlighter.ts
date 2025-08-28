//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { createHighlighterCore, createOnigurumaEngine } from 'shiki';
import oneDarkPro from '@shikijs/themes/one-dark-pro';
import githubDark from '@shikijs/themes/github-dark';
import ts from '@shikijs/langs/ts';
import python from '@shikijs/langs/python';
import md from '@shikijs/langs/md';
import js from '@shikijs/langs/js';

const highlighterPromise = createHighlighterCore({
  langs: [md, js, ts, python],
  themes: [githubDark, oneDarkPro],
  engine: createOnigurumaEngine(import('shiki/wasm')),
});

export { highlighterPromise };
