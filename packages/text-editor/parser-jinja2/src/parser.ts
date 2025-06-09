//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type IToken, Scanner, TokenType } from './scanner'
import * as nodes from './node'

interface ParseContext {
  handover?: () => boolean;
}

class Parser {
  private scanner: Scanner;
  private token: IToken;
  private prevToken: IToken | null;
  private stash: IToken[] = [];

  constructor(scanner: Scanner = new Scanner()) {
    this.scanner = scanner
    this.reset()
  }

  consume() {
    this.prevToken = this.token
    this.token = this.scanner.next()

    return this.token
  }

  accept(tokenType: TokenType) {
    if (this.token.type === tokenType) {
      this.consume()
      return true
    }

    return false
  }

  peek(n = 1) {
    if (n === 1) {
      return this.token
    }

    return this.scanner.lookahead(n - 1)
  }

  reset(source = '') {
    const { scanner } = this
    scanner.setSource(source)
    this.stash = []
    this.token = { type: TokenType.EOS, offset: -1, len: 0, text: '' };
    this.prevToken = null
  }

  parse(source: string) {
    this.reset(source)

    this.consume()

    const program = this.create(nodes.Program)

    program.body.push(...this.subparse())

    return this.finish(program)
  }

  subparse(parseContext?: ParseContext) {
    const body = []
    while (this.token.type !== TokenType.EOS) {
      if (
        typeof parseContext?.handover === 'function' &&
        parseContext.handover() === true
      ) {
        break
      }

      switch (this.token.type) {
        case TokenType.DATA:
          body.push(this.parseData())
          break
        case TokenType.COMMENT_BEGIN:
          body.push(this.parseComment())
          break
        case TokenType.VARIABLE_BEGIN:
          body.push(this.parseVariable())
          break
        case TokenType.BLOCK_BEGIN:
          body.push(this.parseStatement())
          break
      }
    }

    return body
  }

  parseComment() {
    const node = this.create(nodes.Comment)
    this.expect(TokenType.COMMENT_BEGIN)
    if (this.token.type === TokenType.COMMENT) {
      this.consume()
    }
    this.expect(TokenType.COMMENT_END)
    return this.finish(node)
  }

  parseVariable() {
    const node = this.create(nodes.Expression)
    const tokens = []

    this.expect(TokenType.VARIABLE_BEGIN)

    while (true) {
      if (
        this.token.type === TokenType.VARIABLE_END ||
        this.token.type === TokenType.EOS
      ) {
        break
      }

      tokens.push(this.token)

      this.consume()
    }

    this.expect(TokenType.VARIABLE_END)

    node.tokens = tokens

    return this.finish(node)
  }

  expect(tokenType: TokenType, text?: string) {
    if (
      this.token.type === tokenType &&
      (
        (typeof text !== 'string') ||
        (
          typeof text === 'string' &&
          this.token.text === text
        )
      )
    ) {
      this.consume()
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `${this.scanner.substring(0, this.token.offset)}█${this.scanner.substring(this.token.offset)}`,
      )
      throw new Error(`Expect ${tokenType}${text ? `(${text})` : ''}, but got ${this.token.type}${text ? `(${this.token.text})` : ''}`)
    }
  }

  raise() {

  }

  createNode(type: string) {
    return new nodes.Node(this.token.offset, this.token.len, type)
  }

  create<T>(Ctor: nodes.NodeConstructor<T>) {
    return new Ctor(this.token.offset, this.token.len)
  }

  finish(node: nodes.Node) {
    if (this.prevToken) {
      const prevEnd = this.prevToken.offset + this.prevToken.len
      node.length = prevEnd > node.offset ? prevEnd - node.offset : 0
    }
    return node
  }

  parseData() {
    const node = this.create(nodes.Data)
    this.expect(TokenType.DATA)
    return this.finish(node)
  }

  parseStatement() {
    let n = 1
    let peeked
    while ((peeked = this.peek(n)).type !== TokenType.NAME) {
      if (peeked.type === TokenType.EOS || peeked.type === TokenType.BLOCK_END) {
        break
      }
      n++
    }

    if (peeked.type !== TokenType.NAME) {
      throw new Error('Expect NAME after BLOCK_BEGIN')
    }

    switch (peeked.text) {
      case 'if':
        return this.parseIfStatement()
      default:
        break
    }
  }

  parseIfStatement() {
    const node = this.parseIfStatementInner()

    this.expect(TokenType.BLOCK_BEGIN)
    this.expect(TokenType.NAME, 'endif')
    this.expect(TokenType.BLOCK_END)

    return this.finish(node)
  }

  parseIfStatementInner() {
    const node = this.create(nodes.IfStatement)

    this.expect(TokenType.BLOCK_BEGIN)
    this.expect(TokenType.NAME)
    node.test = this.parseExpression()
    this.expect(TokenType.BLOCK_END)
    node.consequent = this.parseBlockStatement({
      handover: () => (
          this.peek(1).type === TokenType.BLOCK_BEGIN &&
          this.peek(2).type === TokenType.NAME &&
          (
            this.peek(2).text === 'elif' ||
            this.peek(2).text === 'else' ||
            this.peek(2).text === 'endif'
          )
        ),
    })

    if (
      this.peek(1).type === TokenType.BLOCK_BEGIN &&
      this.peek(2).type === TokenType.NAME
    ) {
      if (this.peek(2).text === 'elif') {
        const alternate = this.parseIfStatementInner()
        node.alternate = this.finish(alternate)
      } else if (this.peek(2).text === 'else') {
        this.expect(TokenType.BLOCK_BEGIN)
        this.expect(TokenType.NAME, 'else')
        this.expect(TokenType.BLOCK_END)

        node.alternate = this.parseBlockStatement({
          handover: () => (
              this.peek(1).type === TokenType.BLOCK_BEGIN &&
              this.peek(2).type === TokenType.NAME &&
              this.peek(2).text === 'endif'
            ),
        })
      }
    }

    return node
  }

  parseBlockStatement(parseContext?: ParseContext) {
    const node = this.createNode('BlockStatement')
    node.body = this.subparse(parseContext)
    return this.finish(node)
  }

  parseSet() {

  }

  parseFor() {

  }

  parseIf() {

  }

  parseWith() {

  }

  parseAutoEscape() {

  }

  parseBlock() {

  }

  parseExtends() {

  }

  parseImportContext() {

  }

  parseInclude() {

  }

  parseImport() {

  }

  parseFrom() {

  }

  parseSignature() {

  }

  parseCallBlock() {

  }

  parseFilterBlock() {

  }

  parseMacro() {

  }

  parsePrint() {

  }

  parseAssignTarget() {

  }

  parseExpression() {
    const tokens = []
    while (true) {
      if (
        this.token.type === TokenType.BLOCK_END ||
        this.token.type === TokenType.EOS
      ) {
        break
      }

      tokens.push(this.token)

      this.consume()
    }
  }

  parseCondExpr() {

  }

  parseOr() {

  }

  parseAnd() {

  }

  parseNot() {

  }

  parseCompare() {

  }

  parseMath() {

  }

  parseMath2() {

  }

  parseConcat() {

  }

  parsePow() {

  }

  parseUnary() {

  }

  parsePrimary() {

  }

  parseTuple() {

  }

  parseList() {

  }

  parseDict() {

  }

  parsePostfix() {

  }

  parseFilterExpression() {

  }

  parseSubScript() {

  }

  parseSubscribed() {

  }

  parseCallArgs() {

  }

  parseCall() {

  }

  parseFilter() {

  }

  parseTest() {

  }
}

export {
  Parser,
}