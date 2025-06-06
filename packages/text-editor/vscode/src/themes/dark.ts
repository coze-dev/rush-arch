import { tags as t } from '@lezer/highlight';
import { EditorView } from '@codemirror/view';

export const config = {
  name: 'basicDark',
  dark: true,
  background: '#24292e',
  foreground: '#d1d5da',
  selection: '#3392FF44',
  cursor: '#c8e1ff',
  dropdownBackground: '#24292e',
  dropdownBorder: '#1b1f23',
  activeLine: '#4d566022',
  matchingBracket: '#888892',
  keyword: '#9197F1',
  storage: '#f97583',
  variable: '#ffab70',
  variableName: '#D9DCFA',
  parameter: '#e1e4e8',
  function: '#FFCA66',
  string: '#FF9878',
  constant: '#79b8ff',
  type: '#79b8ff',
  class: '#b392f0',
  number: '#2EC7D9',
  comment: '#568B2A',
  heading: '#79b8ff',
  invalid: '#f97583',
  regexp: '#9ecbff',
  propertyName: '#9197F1',
  separator: '#888892',
  gutters: '#888892',
  moduleKeyword: '#CC4FD4',
};

export const darkTheme = () =>
  EditorView.theme(
    {
      '&': {
        color: config.foreground,
        backgroundColor: config.background,
      },

      '.cm-content': { caretColor: config.cursor },

      '.cm-cursor, .cm-dropCursor': { borderLeftColor: config.cursor },
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        { backgroundColor: config.selection },

      '.cm-panels': {
        backgroundColor: config.dropdownBackground,
        color: config.foreground,
      },
      '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
      '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

      '.cm-searchMatch': {
        backgroundColor: config.dropdownBackground,
        outline: `1px solid ${config.dropdownBorder}`,
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: config.selection,
      },

      '.cm-activeLine': { backgroundColor: config.activeLine },
      '.cm-selectionMatch': { backgroundColor: config.selection },

      '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
        backgroundColor: config.matchingBracket,
        outline: 'none',
      },

      '.cm-gutters': {
        backgroundColor: config.background,
        color: config.gutters,
        border: 'none',
      },
      '.cm-activeLineGutter': { backgroundColor: config.background },

      '.cm-foldPlaceholder': {
        backgroundColor: 'transparent',
        border: 'none',
        color: config.foreground,
      },
      '.cm-tooltip': {
        backgroundColor: config.dropdownBackground,
        color: config.foreground,
        border: 'none',
        boxShadow:
          'inset 0 0 0 1px rgba(255, 255, 255, .1), 0 4px 14px rgba(0, 0, 0, .25)!important',
        maxWidth: '400px',
      },
      '.cm-tooltip .cm-tooltip-arrow:before': {
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
      },
      '.cm-tooltip .cm-tooltip-arrow:after': {
        borderTopColor: config.foreground,
        borderBottomColor: config.foreground,
      },
      '.cm-tooltip-autocomplete': {
        '& > ul > li[aria-selected]': {
          background: config.selection,
          color: config.foreground,
        },
      },
      '.cm-tooltip code[class*=language-]': {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: 'rgba(249, 249, 249, 1)',
      },
      '& .cm-scroller': {
        border: '1px solid transparent',
      },
      '& .cm-hover-tooltip-content': {
        fontSize: '12px',
        padding: '0 10px',
        width: '400px',
        overflow: 'auto',
        'max-height': 'calc(100% - 20px)',
      },
      '& .cm-hover-tooltip-content h1': {
        fontSize: '14px',
      },
      '& .cm-tooltip-autocomplete.cm-tooltip': {
        padding: '5px',
        borderRadius: '5px',
      },
      '& .cm-tooltip.cm-tooltip-autocomplete > ul > li': {
        borderRadius: '3px',
        lineHeight: 1.6,
      },
    },
    { dark: config.dark },
  );

export const darkSyntaxTheme = [
  { tag: t.keyword, color: config.keyword },
  { tag: t.variableName, color: config.variableName },
  {
    tag: [t.name, t.deleted, t.character, t.macroName],
    color: config.variable,
  },
  { tag: [t.propertyName], color: config.propertyName },
  {
    tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)],
    color: config.string,
  },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName), t.labelName],
    color: config.function,
  },
  {
    tag: [t.moduleKeyword, t.controlKeyword],
    color: config.moduleKeyword,
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: config.constant,
  },
  { tag: t.definition(t.name), color: config.variable },
  { tag: [t.className], color: config.class },
  {
    tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: config.number,
  },
  { tag: [t.typeName], color: config.type, fontStyle: config.type },
  { tag: [t.operatorKeyword], color: config.keyword },
  { tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp },
  { tag: [t.meta, t.comment], color: config.comment },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.link, textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: config.heading },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable },
  { tag: t.invalid, color: config.invalid },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.separator, color: config.separator },
];
