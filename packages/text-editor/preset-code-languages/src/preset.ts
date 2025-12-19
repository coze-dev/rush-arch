import { asyncOption } from '@coze-editor/utils';
import { value, valueExtension } from '@coze-editor/core-plugins';
import { extension, option } from '@coze-editor/core';

import { getLanguage } from './languages';

export const preset = [
  extension(valueExtension),
  option('value', value),
  ...asyncOption('path', async (path: string) => getLanguage(path)),
];
