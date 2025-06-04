import { parser as jinjaParser } from '@text-editor/lezer-parser-jinja2';
import { parseMixed } from '@lezer/common';
import { LRLanguage } from '@codemirror/language';

import { headingFold, markdownLanguage } from './markdown';

const promptLanguage = LRLanguage.define({
  parser: jinjaParser.configure({
    wrap: parseMixed(node => {
      if (node.type.isTop) {
        return {
          parser: markdownLanguage.parser,
          overlay: [
            {
              from: node.from,
              to: node.to,
            },
          ],
        };
      }

      return null;
    }),
  }),
});

const support = [
  headingFold,
  // autoCloseTags,
];

export { promptLanguage, markdownLanguage, support };
