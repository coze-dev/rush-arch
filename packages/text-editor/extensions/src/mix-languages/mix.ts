//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { parseMixed } from '@lezer/common';
import { parser as templateParser } from '@coze-editor/lezer-parser-template';
import { type Language, LRLanguage } from '@codemirror/language';

interface MixOptions {
  name?: string;
  outerLanguage?: Language;
  innerLanguage?: Language;
}

function mixLanguages({ name, outerLanguage, innerLanguage }: MixOptions) {
  return LRLanguage.define({
    name,
    parser: templateParser.configure({
      wrap: parseMixed(node => {
        if (outerLanguage && node.type.isTop) {
          return {
            parser: outerLanguage.parser,
            overlay: n => n.type.name === 'Text',
          };
        }

        if (innerLanguage && node.name === 'InterpolationContent') {
          return {
            parser: innerLanguage.parser,
          };
        }

        return null;
      }),
    }),
  });
}

export { mixLanguages };
