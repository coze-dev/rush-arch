//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type { LayerMarker } from '@codemirror/view';

export class EmptyBlock implements LayerMarker {
  constructor(
    private lineNumber: number,
    readonly contentHeight: number,
    readonly scrollHeight?: number,
  ) {}

  draw() {
    const elt = document.createElement('div');
    elt.className = 'cm-empty-scroll-block-maker';
    this.adjust(elt);
    return elt;
  }

  update(_: HTMLElement, prev: EmptyBlock) {
    return (
      prev.lineNumber === this.lineNumber &&
      prev.contentHeight === this.contentHeight &&
      prev.scrollHeight === this.scrollHeight
    );
  }

  private adjust(elt: HTMLElement) {
    elt.style.display = 'block';
    elt.style.width = '1px';

    if (this.lineNumber > 1) {
      elt.style.height = `calc(${typeof this.scrollHeight === 'number' ? `${this.scrollHeight}px` : '100%'} + ${this.contentHeight}px)`;
    } else {
      elt.style.height = '0';
    }
  }

  eq(p: EmptyBlock) {
    return (
      this.lineNumber === p.lineNumber &&
      this.contentHeight === p.contentHeight &&
      this.scrollHeight === p.scrollHeight
    );
  }
}
