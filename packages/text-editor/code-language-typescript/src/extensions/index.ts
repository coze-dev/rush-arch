import { textDocumentField } from '@text-editor/code-language-shared';

import { typescriptLanguageService } from '../service';
import typeInformation from './type-information';

const extensions = [
  typeInformation(async (state, pos) => {
    const { textDocument, generatedRangeFor } = state.field(textDocumentField);
    const range = generatedRangeFor({ from: pos, to: pos });
    const offset = range?.from;

    if (typeof offset !== 'number') {
      return null;
    }

    const result = await typescriptLanguageService.getTypeInformation({
      textDocument,
      offset,
    });

    return result;
  }),
];

export default extensions;
