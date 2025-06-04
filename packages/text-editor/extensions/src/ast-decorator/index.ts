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
