//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { WidgetType } from '@codemirror/view';

interface SpanWidgetOptions {
  text?: string;
  className?: string;
}

class SpanWidget extends WidgetType {
  public text?: string;
  public className?: string;

  constructor(options: SpanWidgetOptions) {
    super();

    this.text = options.text;
    this.className = options.className;
  }

  toDOM() {
    const dom = document.createElement('span');
    dom.innerText = this.text ?? '';
    dom.classList.add(this.className ?? '');
    return dom;
  }

  eq(other: SpanWidget) {
    return this.text === other.text && this.className === other.className;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

export { SpanWidget };
