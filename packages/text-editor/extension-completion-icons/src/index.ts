import { EditorView } from '@codemirror/view';
import './index.css';

// https://code.visualstudio.com/docs/editor/intellisense#_types-of-completions
const iconContents = {
  // --- method / function / constructor ---
  '.cm-completionIcon-method::after': {
    content: '"\\e00d"',
  },

  '.cm-completionIcon-function::after': {
    content: '"\\e00d"',
  },

  '.cm-completionIcon-constructor::after': {
    content: '"\\e00d"',
  },

  // --- variable ---

  '.cm-completionIcon-variable::after': {
    content: '"\\e015"',
  },

  // --- field ---
  '.cm-completionIcon-field::after': {
    content: '"\\e009"',
  },

  // --- typeParameter ---
  '.cm-completionIcon-typeParameter::after': {
    content: '"\\e010"',
  },

  // --- constant ---
  '.cm-completionIcon-constant::after': {
    content: '"\\e006"',
  },

  // --- class ---
  '.cm-completionIcon-class::after': {
    content: '"\\e004"',
  },

  // --- interface ---
  '.cm-completionIcon-interface::after': {
    content: '"\\e00a"',
  },

  // --- struct ---
  '.cm-completionIcon-struct::after': {
    content: '"\\e014"',
  },

  // --- event ---
  '.cm-completionIcon-event::after': {
    content: '"\\e008"',
  },

  // --- operator ---
  '.cm-completionIcon-operator::after': {
    content: '"\\e00f"',
  },

  // --- module ---
  '.cm-completionIcon-module::after': {
    content: '"\\e00e"',
  },

  // --- property ---
  '.cm-completionIcon-property::after': {
    content: '"\\e011"',
  },

  // --- value / enum ---
  '.cm-completionIcon-value::after': {
    content: '"\\e007"',
  },
  '.cm-completionIcon-enum::after': {
    content: '"\\e007"',
  },

  // --- reference ---
  '.cm-completionIcon-reference::after': {
    content: '"\\e003"',
  },

  // --- keyword ---
  '.cm-completionIcon-keyword::after': {
    content: '"\\e00c"',
  },

  // --- file ---
  '.cm-completionIcon-file::after': {
    content: '"\\e001"',
  },

  // --- folder ---
  '.cm-completionIcon-folder::after': {
    content: '"\\e002"',
  },

  // --- color ---
  '.cm-completionIcon-color::after': {
    content: '"\\e005"',
  },

  // --- unit ---
  '.cm-completionIcon-unit::after': {
    content: '"\\e012"',
  },

  // --- snippet ---
  '.cm-completionIcon-snippet::after': {
    content: '"\\e013"',
  },

  // --- text ---
  '.cm-completionIcon-text::after': {
    content: '"\\e00b"',
  },
};

const icons = EditorView.theme({
  '.cm-completionIcon::after': {
    fontFamily: '"codicon-cm"',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },
  ...iconContents,
});

export { icons };
