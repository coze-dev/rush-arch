import { styleTags, tags as t } from '@lezer/highlight'

export const jinjaHighlighting = styleTags({
  'JinjaExpressionStart JinjaExpressionEnd JinjaStatementStart JinjaStatementEnd': t.angleBracket,
  'JinjaCommentStart JinjaCommentContent JinjaCommentEnd': t.blockComment,
})