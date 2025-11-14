import { parser } from '@lezer/html';
import { LRLanguage } from '@codemirror/language';

const htmlParser = parser.configure({
  dialect: 'noMatch',
});

function parse(text: string) {
  return htmlParser.parse(text);
}

const htmlLanguage = LRLanguage.define({
  parser: htmlParser,
});

export { parse, htmlLanguage };
