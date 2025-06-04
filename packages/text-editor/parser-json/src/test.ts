/* eslint-disable */
import { TextDocument } from 'vscode-languageserver-textdocument';
import { parse } from './parser';

const out = parse(
  TextDocument.create('', 'json', 0, `{"a": 'b'}`)
)

console.log('out', out)