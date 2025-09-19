//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type LanguageConfig } from '@coze-editor/code-language-shared';
import type { Extension } from '@codemirror/state';
import { sql as langSql } from '@codemirror/lang-sql';

const sqlLangSupport = langSql({
  upperCaseKeywords: true,
});
const sqlLanguage = sqlLangSupport.language;

const extensions: Extension[] = [sqlLangSupport.support];

const sql: LanguageConfig = {
  language: sqlLanguage,
  extensions,
};

export { sql, sqlLanguage, extensions };
