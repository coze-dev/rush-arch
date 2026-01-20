import { asyncOption } from '@coze-editor/core';

import { getLanguage } from './languages';

export const preset = [
  ...asyncOption('path', (path?: string) => getLanguage(path ?? ''), {
    reset: true,
  }),
];
