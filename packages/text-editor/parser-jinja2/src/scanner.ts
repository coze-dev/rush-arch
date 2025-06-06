/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-control-regex */
import { TextStream } from './stream';
import { TokenType } from './token';

const enum CharacterCodes {
  lineFeed = 0x0A,              // \n
  carriageReturn = 0x0D,        // \r
  space = 0x0020,   // " "

  _0 = 0x30,
  _1 = 0x31,
  _2 = 0x32,
  _3 = 0x33,
  _4 = 0x34,
  _5 = 0x35,
  _6 = 0x36,
  _7 = 0x37,
  _8 = 0x38,
  _9 = 0x39,

  a = 0x61,
  b = 0x62,
  c = 0x63,
  d = 0x64,
  e = 0x65,
  f = 0x66,
  g = 0x67,
  h = 0x68,
  i = 0x69,
  j = 0x6A,
  k = 0x6B,
  l = 0x6C,
  m = 0x6D,
  n = 0x6E,
  o = 0x6F,
  p = 0x70,
  q = 0x71,
  r = 0x72,
  s = 0x73,
  t = 0x74,
  u = 0x75,
  v = 0x76,
  w = 0x77,
  x = 0x78,
  y = 0x79,
  z = 0x7A,

  A = 0x41,
  B = 0x42,
  C = 0x43,
  D = 0x44,
  E = 0x45,
  F = 0x46,
  G = 0x47,
  H = 0x48,
  I = 0x49,
  J = 0x4A,
  K = 0x4B,
  L = 0x4C,
  M = 0x4D,
  N = 0x4E,
  O = 0x4F,
  P = 0x50,
  Q = 0x51,
  R = 0x52,
  S = 0x53,
  T = 0x54,
  U = 0x55,
  V = 0x56,
  W = 0x57,
  X = 0x58,
  Y = 0x59,
  Z = 0x5a,

  asterisk = 0x2A,              // *
  backslash = 0x5C,             // \
  closeBrace = 0x7D,            // }
  closeBracket = 0x5D,          // ]
  closeParen = 0x29,            // )
  colon = 0x3A,                 // :
  comma = 0x2C,                 // ,
  dot = 0x2E,                   // .
  singleQuote = 0x27,           // '
  doubleQuote = 0x22,           // "
  minus = 0x2D,                 // -
  openBrace = 0x7B,             // {
  openBracket = 0x5B,           // [
  openParen = 0x28,             // (
  plus = 0x2B,                  // +
  slash = 0x2F,                 // /
  hash = 0x23,                  // #
  percent = 0x25,               // %

  formFeed = 0x0C,              // \f
  tab = 0x09,                   // \t
}

const operatorTokenTable: Record<string, TokenType> = {
  '+': TokenType.ADD,
  '-': TokenType.SUB,
  '/': TokenType.DIV,
  '//': TokenType.FLOORDIV,
  '*': TokenType.MUL,
  '%': TokenType.MOD,
  '**': TokenType.POW,
  '~': TokenType.TILDE,
  '[': TokenType.LBRACKET,
  ']': TokenType.RBRACKET,
  '(': TokenType.LPAREN,
  ')': TokenType.RPAREN,
  '{': TokenType.LBRACE,
  '}': TokenType.RBRACE,
  '==': TokenType.EQ,
  '!=': TokenType.NE,
  '>': TokenType.GT,
  '>=': TokenType.GTEQ,
  '<': TokenType.LT,
  '<=': TokenType.LTEQ,
  '=': TokenType.ASSIGN,
  '.': TokenType.DOT,
  ':': TokenType.COLON,
  '|': TokenType.PIPE,
  ',': TokenType.COMMA,
  ';': TokenType.SEMICOLON,
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const operatorLabels = Object.keys(operatorTokenTable)
// sort by length
operatorLabels.sort((a, b) => b.length - a.length)

const operatorRe = new RegExp(
  operatorLabels.map(escapeRegExp).join('|'),
  'g',
)

enum ScannerState {
  WithinData,
  WithinComment,
  WithinVariable,
  WithinBlock,
}

enum ScanError {
  None,
  UnexpectedEndOfString,
}

class Context {
  private _states: ScannerState[] = []
  private _operators: number[] = []

  constructor(private _initialState: ScannerState) {
    this.reset()
  }

  get state() {
    return this._states[this._states.length - 1]
  }

  popState() {
    return this._states.pop()
  }

  pushState(state: ScannerState) {
    this._states.push(state)
  }

  isOperatorBalanced() {
    return this._operators.length === 0
  }

  balanceOperator(op: number) {
    if (
      op === CharacterCodes.openBrace ||
      op === CharacterCodes.openBracket ||
      op === CharacterCodes.openParen
    ) {
      this._operators.push(op)
      return
    }

    const lastOp = this._operators[this._operators.length - 1]
    if (!lastOp) {
      return
    }

    const mapToOpen = {
      [CharacterCodes.closeBrace]: CharacterCodes.openBrace,
      [CharacterCodes.closeBracket]: CharacterCodes.openBracket,
      [CharacterCodes.closeParen]: CharacterCodes.openParen,
    }

    if (
      (
        op === CharacterCodes.closeBrace ||
        op === CharacterCodes.closeBracket ||
        op === CharacterCodes.closeParen
      ) &&
      (lastOp === mapToOpen[op])
    ) {
      this._operators.pop()
    }
  }

  reset() {
    this._states = typeof this._initialState !== 'undefined' ? [this._initialState] : []
    this._operators = []
  }
}

const integerRe = /^(0b(_?[0-1])+|0o(_?[0-7])+|0x(_?[\da-f])+|[1-9](_?\d)*|0(_?0)*)/ig;

function isWhitespace(ch: number) {
  return ch === CharacterCodes.space || ch === CharacterCodes.tab
}

function isLineBreak(ch: number) {
  return ch === CharacterCodes.lineFeed || ch === CharacterCodes.carriageReturn
}

function isASCIILetter(ch: number) {
  return ch >= 97 && ch <= 122 || ch >= 65 && ch <= 90
}

function isIdentifierStart(ch) {
  if (ch === 95) { // 下划线 '_' 的 Unicode 码点
    return true;
  }
  if ((ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122)) { // 'A'-'Z' 以及 'a'-'z'
    return true;
  }
  // 检查更广泛的字母用途，排除数字
  // 一种方法是将码点转换回字符，然后使用 char 变量进行检查
  const char = String.fromCharCode(ch);
  if (isNaN(parseInt(char, 10)) && /^[^\x00-\x7F]/.test(char)) {
    return true;
  }
  return false;
}

export interface IToken {
  type: TokenType;
  text: string;
  offset: number;
  len: number;
}

export interface ScannerOptions {
  block_start_string?: string;
  block_end_string?: string;
  variable_start_string?: string;
  variable_end_string?: string;
  comment_start_string?: string;
  comment_end_string?: string;
}

class Scanner {
  public stream = new TextStream('');
  public scanError = null;
  private ctx = new Context(ScannerState.WithinData);
  private stash: IToken[] = [];

  // regexps
  private blockStartRe
  private blockEndRe
  private variableStartRe
  private variableEndRe
  private commentStartRe
  private commentEndRe

  constructor(private options?: ScannerOptions) {
    this.blockStartRe = escapeRegExp(options?.block_start_string ?? '{%')
    this.blockEndRe = escapeRegExp(options?.block_end_string ?? '%}')
    this.variableStartRe = escapeRegExp(options?.variable_start_string ?? '{{')
    this.variableEndRe = escapeRegExp(options?.variable_end_string ?? '}}')
    this.commentStartRe = escapeRegExp(options?.comment_start_string ?? '{#')
    this.commentEndRe = escapeRegExp(options?.comment_end_string ?? '#}')
  }

  setSource(source: string) {
    this.stream = new TextStream(source)
    this.ctx.reset()
    this.stash = []
  }

  substring(from: number, to?: number) {
    return this.stream.substring(from, to);
  }

  public finishToken(offset: number, type: TokenType, text ?: string): IToken {
    return {
      type,
      offset,
      len: this.stream.pos() - offset,
      text: text || this.stream.substring(offset, this.stream.pos()),
    };
  }

  readString() {
    const { stream } = this;
    const ch = stream.next
    if (
      ch === CharacterCodes.singleQuote ||
      ch === CharacterCodes.doubleQuote
    ) {
      const offset = stream.pos()
      const closeQuote = stream.next
      stream.advance()

      while (true) {
        if (stream.eos()) {
          break
        }

        if (isLineBreak(stream.next)) {
          break
        }

        if (stream.next === closeQuote) {
          break
        }

        if (
          stream.next === CharacterCodes.backslash &&
          stream.peek(1) === closeQuote
        ) {
          stream.advance(2)
        } else {
          stream.advance()
        }
      }

      if (stream.next === closeQuote) {
        stream.advance()
        return this.finishToken(offset, TokenType.STRING)
      } else {
        this.scanError = ScanError.UnexpectedEndOfString
        return this.finishToken(offset, TokenType.STRING)
      }
    }
  }

  readInteger() {
    const { stream } = this
    const offset = stream.pos()
    if (stream.advanceIfRegExp(integerRe)) {
      return this.finishToken(offset, TokenType.INTEGER)
    }
  }

  readFloat() {

  }

  readNumber() {

  }

  readIdentifier() {
    const { stream } = this
    const offset = stream.pos()
    if (stream.advanceIfRegExp(/^\w[\w\d]*/)) {
      return this.finishToken(offset, TokenType.NAME)
    }
  }

  readOperator() {
    const { stream, ctx } = this
    const offset = stream.pos()
    if (stream.advanceIfRegExp(operatorRe)) {
      const pos = stream.pos()
      if (pos - offset === 1) {
        ctx.balanceOperator(stream.substring(pos - 1, pos).charCodeAt(0))
      }
      return this.finishToken(offset, TokenType.OPERATOR)
    }
  }

  next() {
    return this.stash.length > 0 ? this.stash.pop() : this.scan()
  }

  lookahead(n = 1) {
    const { stash } = this

    let m = n - stash.length
    while (m > 0) {
      stash.push(this.scan())
      m--
    }

    return stash[n - 1]
  }

  private scan() {
    const { stream, ctx } = this

    let offset = stream.pos()

    if (stream.eos()) {
      return this.finishToken(offset, TokenType.EOS)
    }

    let token: IToken | null = null
    switch (ctx.state) {
      case ScannerState.WithinData:
        if (stream.advanceIfChar(CharacterCodes.openBrace)) {
          // {#
          if (stream.advanceIfChar(CharacterCodes.hash)) {
            ctx.pushState(ScannerState.WithinComment)
            return this.finishToken(offset, TokenType.COMMENT_BEGIN)
          }

          // {{
          if (stream.advanceIfChar(CharacterCodes.openBrace)) {
            ctx.pushState(ScannerState.WithinVariable)
            return this.finishToken(offset, TokenType.VARIABLE_BEGIN)
          }

          // {%
          if (stream.advanceIfChar(CharacterCodes.percent)) {
            ctx.pushState(ScannerState.WithinBlock)
            return this.finishToken(offset, TokenType.BLOCK_BEGIN)
          }
        }

        stream.advanceUntilChar(CharacterCodes.openBrace)
        return this.finishToken(offset, TokenType.DATA)
      case ScannerState.WithinComment:
        // #}
        if (stream.advanceIfChars([CharacterCodes.hash, CharacterCodes.closeBrace])) {
          ctx.pushState(ScannerState.WithinData)
          return this.finishToken(offset, TokenType.COMMENT_END)
        }

        stream.advanceUntilChars([CharacterCodes.hash, CharacterCodes.closeBrace])
        return this.finishToken(offset, TokenType.COMMENT)
      case ScannerState.WithinVariable:
        // TODO: sign
        stream.advanceWhile((ch) => isWhitespace(ch))
        offset = stream.pos()

        if (
          stream.peekChars([CharacterCodes.closeBrace, CharacterCodes.closeBrace]) &&
          // TODO: 判断 balanced 且 lastOp 和 variableEnd 字符相同
          ctx.isOperatorBalanced()
        ) {
          ctx.popState()
          stream.advance(2)
          return this.finishToken(offset, TokenType.VARIABLE_END)
        }

        token = this.readString() || this.readIdentifier() || this.readFloat() || this.readInteger() || this.readOperator()

        if (token) {
          return token
        }
        break;
      case ScannerState.WithinBlock:
        // TODO: sign
        stream.advanceWhile((ch) => isWhitespace(ch))
        offset = stream.pos()

        if (stream.peekChars([CharacterCodes.percent, CharacterCodes.closeBrace])) {
          ctx.popState()
          stream.advance(2)
          return this.finishToken(offset, TokenType.BLOCK_END)
        }

        token = this.readString() || this.readIdentifier() || this.readFloat() || this.readInteger() || this.readOperator()

        if (token) {
          return token
        }
        break;
    }

    stream.advance()
    return this.finishToken(offset, TokenType.UNKNOWN)
  }
}

export {
  Scanner,
  TokenType,
}