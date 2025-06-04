import { Text } from 'text-mapping';
import { type Transformer } from '@text-editor/code-language-shared';

const transformerCreator =
  (processor: (text: Text) => Text): Transformer =>
  (source: string) => {
    const text = processor(new Text(source));
    return {
      code: text.toString(),
      mapping: {
        originalRangeFor: text.originalRangeFor.bind(text),
        generatedRangeFor: text.generatedRangeFor.bind(text),
        originalOffsetFor: text.originalOffsetFor.bind(text),
        generatedOffsetFor: text.generatedOffsetFor.bind(text),
      },
    };
  };

export { transformerCreator };
