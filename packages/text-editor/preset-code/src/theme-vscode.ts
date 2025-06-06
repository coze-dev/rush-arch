import {
  darkSyntaxTheme,
  darkTheme,
  lightSyntaxTheme,
  lightTheme,
} from '@coze-editor/vscode';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';

export const vscodeLight = [
  syntaxHighlighting(HighlightStyle.define(lightSyntaxTheme)),
  lightTheme(),
];

export const vscodeDark = [
  syntaxHighlighting(HighlightStyle.define(darkSyntaxTheme)),
  darkTheme(),
];
