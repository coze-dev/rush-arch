//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  wholeASTDecoratorFacet,
  updateWholeDecorations,
  type WholeASTDecorator,
} from './whole';
import { cursorASTDecoratorFacet, type CursorASTDecorator } from './cursor';

const astDecorator = {
  whole: wholeASTDecoratorFacet,
  fromCursor: cursorASTDecoratorFacet,
};

export {
  astDecorator,
  updateWholeDecorations,
  type WholeASTDecorator,
  type CursorASTDecorator,
};
