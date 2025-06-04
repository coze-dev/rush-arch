import { styleTags, tags as t } from '@lezer/highlight';

export const highlight = styleTags({
  '{{ }}': t.separator,
});
