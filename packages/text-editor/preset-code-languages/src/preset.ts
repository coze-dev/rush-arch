import { asyncOption } from '@coze-editor/core';

import { getLanguage } from './languages';

export const preset = [
  ...asyncOption('path', async (path: string) => getLanguage(path)),
];
