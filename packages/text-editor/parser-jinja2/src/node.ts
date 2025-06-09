//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

interface NodeConstructor<T> {
  new(offset?: number, len?: number): T;
}

class Node {
  public type: string | undefined;
  public offset: number;
  public length: number;
  public children: Node[] | undefined;
  [key: string]: any;

  constructor(offset = -1, len = -1, nodeType?: string) {
    this.offset = offset
    this.length = len
    if (nodeType) {
      this.type = nodeType
    }
  }
}

class Program extends Node {
  type = 'Program'
  body: Node[] = []
}

class Data extends Node {
  type = 'Data'
}

class Comment extends Node {
  type = 'Comment'
}

class IfStatement extends Node {
  type = 'IfStatement'
}

class Expression extends Node {
  type = 'Expression'
}

export {
  Node,
  Program,
  Data,
  Comment,
  IfStatement,
  Expression,
}

export type {
  NodeConstructor,
}