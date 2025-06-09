//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

export {
  astDecorator,
  updateWholeDecorations,
  type WholeASTDecorator,
  type CursorASTDecorator,
} from './ast-decorator';

export { astDebugger } from './ast-debugger';

export { focusableKeymap, FocusableWidget } from './focusable';

export {
  rangesFacet as autoSelectRanges,
  selectUserEvent as autoSelectUserEvent,
} from './auto-select-ranges';

export {
  selectionEnlarger,
  type SelectionEnlargerSpec,
} from './selection-enlarger';

export {
  deletionEnlarger,
  type DeletionEnlargerSpec,
} from './deletion-enlarger';

export { inputRules, type InputRule } from './input-rules';

export { mixLanguages } from './mix-languages';

export { indentGuides } from './indent-guides';

export { scrollBeyondLastLine } from './scroll-beyond-last-line';

export { colorizationBrackets, matchingBrackets } from './brackets';

export {
  elementAtPosition,
  positionElementLayer,
  SelectionSide,
} from './position';

export { backgroundDecorations } from './background-decorations';

export { mergeableMarkers } from './mergeable-markers';
