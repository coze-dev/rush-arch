//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

// from: https://github.com/vadimdemedes/thememirror/blob/main/source/create-theme.ts
// license: MIT

import { EditorView } from '@codemirror/view';
import { type Extension } from '@codemirror/state';
import {
  HighlightStyle,
  type TagStyle,
  syntaxHighlighting,
} from '@codemirror/language';

interface Theme {
  /**
   * Theme variant. Determines which styles CodeMirror will apply by default.
   */
  variant: Variant;

  /**
   * Settings to customize the look of the editor, like background, gutter, selection and others.
   */
  settings: Settings;

  /**
   * Syntax highlighting styles.
   */
  styles: TagStyle[];
}

type Variant = 'light' | 'dark';

interface StyleSpec {
  [propOrSelector: string]: string | number | StyleSpec | null;
}

interface Settings {
  /**
   * Editor background.
   */
  background: string;

  /**
   * Default text color.
   */
  foreground: string;

  /**
   * Caret color.
   */
  caret: string;

  /**
   * Selection background.
   */
  selection: string;

  /**
   * Background of highlighted lines.
   */
  lineHighlight: string;

  /**
   * Gutter background.
   */
  gutterBackground: string;

  /**
   * Text color inside gutter.
   */
  gutterForeground: string;

  /**
   * Gutter border color
   */
  gutterBorderColor: string;

  /**
   * Gutter border width
   */
  gutterBorderWidth?: number;

  // bracket colors
  bracketColors?: string[];

  // tooltip style
  tooltip: StyleSpec;

  // tooltip completion style
  tooltipCompletion?: StyleSpec;

  link?: StyleSpec;

  // hovered completion item style
  completionItemHover?: StyleSpec;
  // selected completion item style
  completionItemSelected?: StyleSpec;

  completionItemIcon?: StyleSpec;
  completionItemLabel?: StyleSpec;
  completionItemInfo?: StyleSpec;
  completionItemDetail?: StyleSpec;
}

const createTheme = ({ variant, settings, styles }: Theme): Extension => {
  const bracketTheme = (settings.bracketColors ?? []).reduce(
    (memo, color, index) => ({
      ...memo,
      [`.colorization-bracket-${index}`]: { color },
      [`.colorization-bracket-${index} > span`]: { color },
    }),
    {},
  );

  const tooltipTheme = {
    '.cm-tooltip': settings.tooltip ?? {},
    '.cm-tooltip-autocomplete': settings.tooltipCompletion ?? {},
    '.cm-tooltip a': settings.link ?? {
      color: '#4daafc',
    },
  };

  const completionTheme = {
    '.cm-tooltip-autocomplete ul li[aria-selected]':
      settings.completionItemSelected ?? {},
    '.cm-tooltip-autocomplete ul li:not([aria-selected]):hover':
      settings.completionItemHover ?? {},
    '.cm-completionIcon': settings.completionItemIcon ?? {},
    '.cm-completionLabel': settings.completionItemLabel ?? {},
    '.cm-completionDetail': settings.completionItemDetail ?? {},
    '.cm-completionInfo': settings.completionItemInfo ?? {},
  };

  const theme = EditorView.theme(
    {
      '&': {
        backgroundColor: settings.background,
        color: settings.foreground,
      },
      '.cm-content': {
        caretColor: settings.caret,
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: settings.caret,
      },
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: settings.selection,
        },
      '.cm-activeLine': {
        backgroundColor: settings.lineHighlight,
      },
      '.cm-gutters': {
        backgroundColor: settings.gutterBackground,
        color: settings.gutterForeground,
        borderRightColor: settings.gutterBorderColor,
        borderRightWidth: `${settings.gutterBorderWidth}px`,
      },
      '.cm-activeLineGutter': {
        backgroundColor: settings.lineHighlight,
      },
      ...bracketTheme,
      ...tooltipTheme,
      ...completionTheme,
    },
    {
      dark: variant === 'dark',
    },
  );

  const highlightStyle = HighlightStyle.define(styles);
  const extension = [theme, syntaxHighlighting(highlightStyle)];

  return extension;
};

export default createTheme;

export { type Theme };
