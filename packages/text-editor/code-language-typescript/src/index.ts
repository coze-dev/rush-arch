import { typescriptLanguage } from '@codemirror/lang-javascript';

import {
  TypeScriptLanguageService,
  typescriptLanguageService,
} from './service';
import extensions from './extensions';

const typescript = {
  language: typescriptLanguage,
  languageService: typescriptLanguageService,
  extensions,
};

export {
  typescript,
  typescriptLanguage,
  typescriptLanguageService,
  TypeScriptLanguageService,
};
