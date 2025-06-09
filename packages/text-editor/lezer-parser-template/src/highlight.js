//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { styleTags, tags as t } from '@lezer/highlight';

export const highlight = styleTags({
  '{{ }}': t.separator,
});
