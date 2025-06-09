//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

class TextStream {
  private source: string;
  private position: number;
  private len: number

  constructor(source: string) {
    this.source = source
    this.position = 0
    this.len = source.length
  }

  public eos(): boolean {
    return this.position >= this.source.length
  }

  public pos(): number {
    return this.position
  }

  public advance(n = 1) {
    this.position = this.position + n
  }

  public goToEnd(): void {
    this.position = this.source.length;
  }

  public substring(from: number, to: number = this.position) {
    return this.source.substring(from, to)
  }

  get next() {
    return this.peek(1)
  }

  public peek(n = 1) {
    return this.source.charCodeAt(this.position + n)
  }

  public peekChars(ch: number[]): boolean {
    let i: number;
    if (this.position + ch.length > this.source.length) {
      return false;
    }
    for (i = 0; i < ch.length; i++) {
      if (this.source.charCodeAt(this.position + i) !== ch[i]) {
        return false;
      }
    }
    return true
  }

  public advanceIfChar(ch: number): boolean {
    if (ch === this.source.charCodeAt(this.position)) {
      this.position++;
      return true;
    }
    return false;
  }

  public advanceIfChars(ch: number[]): boolean {
    let i: number;
    if (this.position + ch.length > this.source.length) {
      return false;
    }
    for (i = 0; i < ch.length; i++) {
      if (this.source.charCodeAt(this.position + i) !== ch[i]) {
        return false;
      }
    }
    this.advance(i);
    return true;
  }

  public advanceUntilChar(ch: number): boolean {
    while (this.position < this.source.length) {
      if (this.source.charCodeAt(this.position) === ch) {
        return true;
      }
      this.advance(1);
    }
    return false;
  }

  public advanceUntilChars(ch: number[]): boolean {
    while (this.position + ch.length <= this.source.length) {
      let i = 0;
      // eslint-disable-next-line no-empty
      for (; i < ch.length && this.source.charCodeAt(this.position + i) === ch[i]; i++) {
      }
      if (i === ch.length) {
        return true;
      }
      this.advance(1);
    }
    this.goToEnd();
    return false;
  }

  public advanceUntilRegExp(regex: RegExp): string {
    const str = this.source.substring(this.position);
    const match = str.match(regex);
    if (match) {
      this.position = this.position + (match.index ?? 0);
      return match[0];
    } else {
      this.goToEnd();
    }
    return '';
  }

  public advanceWhile(condition: (ch: number) => boolean): number {
    const posNow = this.position;
    while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
      this.position++;
    }
    return this.position - posNow;
  }

  public advanceIfRegExp(regex: RegExp): string {
    const str = this.source.substring(this.position);
    const match = str.match(regex);
    if (match) {
      this.position = this.position + (match.index ?? 0) + match[0].length;
      return match[0];
    }
    return '';
  }
}

export {
  TextStream,
}