//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

// Modified from
// vscode-json-languageservice
//   - Tag: 5.4.1
//   - commit SHA: 493010da9dc2cd1cc139d403d4709d97064b17e9
// node-jsonc-parser
//   - Tag: 3.3.1
//   - commit SHA: 3c9b4203d663061d87d4d34dd0004690aef94db5
export { parse } from './parser';

export { findNodeAtOffset } from './helpers';

export { ErrorCode } from './types';

export type {
  IRange,
  IProblem,
  // ast nodes
  ASTNode,
  ObjectASTNode,
  PropertyASTNode,
  ArrayASTNode,
  StringASTNode,
  NumberASTNode,
  BooleanASTNode,
  NullASTNode,
} from './types';
