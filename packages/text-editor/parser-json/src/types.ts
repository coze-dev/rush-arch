//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/
import { type DiagnosticSeverity } from 'vscode-languageserver-types';

export enum SchemaDraft {
  v3 = 3,
  v4 = 4,
  v6 = 6,
  v7 = 7,
  v2019_09 = 19,
  v2020_12 = 20,
}

/**
 * Error codes used by diagnostics
 */
export enum ErrorCode {
  Undefined = 0,
  EnumValueMismatch = 1,
  Deprecated = 2,
  UnexpectedEndOfComment = 0x101,
  UnexpectedEndOfString = 0x102,
  UnexpectedEndOfNumber = 0x103,
  InvalidUnicode = 0x104,
  InvalidEscapeCharacter = 0x105,
  InvalidCharacter = 0x106,
  PropertyExpected = 0x201,
  CommaExpected = 0x202,
  ColonExpected = 0x203,
  ValueExpected = 0x204,
  CommaOrCloseBacketExpected = 0x205,
  CommaOrCloseBraceExpected = 0x206,
  TrailingComma = 0x207,
  DuplicateKey = 0x208,
  CommentNotPermitted = 0x209,
  PropertyKeysMustBeDoublequoted = 0x210,
  StringValueMustBeDoublequoted = 0x211,
  SchemaResolveError = 0x300,
  SchemaUnsupportedFeature = 0x301,
}

export interface IRange {
  offset: number;
  length: number;
}

export interface IProblem {
  location: IRange;
  severity?: DiagnosticSeverity;
  code?: ErrorCode;
  message: string;
}

export type ASTNode =
  | ObjectASTNode
  | PropertyASTNode
  | ArrayASTNode
  | StringASTNode
  | NumberASTNode
  | BooleanASTNode
  | NullASTNode;

export interface BaseASTNode {
  readonly type:
    | 'object'
    | 'array'
    | 'property'
    | 'string'
    | 'number'
    | 'boolean'
    | 'null';
  readonly parent?: ASTNode;
  readonly offset: number;
  readonly length: number;
  readonly children?: ASTNode[];
  readonly value?: string | boolean | number | null;
}
export interface ObjectASTNode extends BaseASTNode {
  readonly type: 'object';
  readonly properties: PropertyASTNode[];
  readonly children: ASTNode[];
}
export interface PropertyASTNode extends BaseASTNode {
  readonly type: 'property';
  readonly keyNode: StringASTNode;
  readonly valueNode?: ASTNode;
  readonly colonOffset?: number;
  readonly children: ASTNode[];
}
export interface ArrayASTNode extends BaseASTNode {
  readonly type: 'array';
  readonly items: ASTNode[];
  readonly children: ASTNode[];
}
export interface StringASTNode extends BaseASTNode {
  readonly type: 'string';
  readonly value: string;
}
export interface NumberASTNode extends BaseASTNode {
  readonly type: 'number';
  readonly value: number;
  readonly isInteger: boolean;
}
export interface BooleanASTNode extends BaseASTNode {
  readonly type: 'boolean';
  readonly value: boolean;
}
export interface NullASTNode extends BaseASTNode {
  readonly type: 'null';
  readonly value: null;
}
