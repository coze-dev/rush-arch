//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { typescriptLanguage } from '@coze-editor/lang-javascript';

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
