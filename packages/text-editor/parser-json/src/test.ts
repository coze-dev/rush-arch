//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

/* eslint-disable */
import { TextDocument } from 'vscode-languageserver-textdocument';
import { parse } from './parser';

const out = parse(
  TextDocument.create('', 'json', 0, `{"a": 'b'}`)
)

console.log('out', out)