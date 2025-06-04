import { type LanguageConfig } from '@text-editor/code-language-shared';
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
