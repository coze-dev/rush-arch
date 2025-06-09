//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type LanguageConfig } from '@coze-editor/code-language-shared';
import type { Extension } from '@codemirror/state';
import {
  globalCompletion,
  localCompletionSource,
  pythonLanguage,
} from '@codemirror/lang-python';

const extensions: Extension[] = [
  pythonLanguage.data.of({ autocomplete: localCompletionSource }),
  pythonLanguage.data.of({ autocomplete: globalCompletion }),
];

const python: LanguageConfig = {
  language: pythonLanguage,
  extensions,
};

export { python, pythonLanguage, extensions };
