import { Decoration, WidgetType } from '@codemirror/view';

import { type CursorWidgetConfig } from './common';

class CustomDivWidget extends WidgetType {
  customDOM?: HTMLElement;
  constructor(customDOM?: HTMLElement) {
    super();
    this.customDOM = customDOM;
  }
  toDOM() {
    const div = document.createElement('div');
    div.className = 'cursor-widget-wrapper';
    div.setAttribute('style', 'caret-color: initial;');
    if (this.customDOM) {
      div.appendChild(this.customDOM);
    }
    return div;
  }
  eq(widget: CustomDivWidget): boolean {
    return widget.customDOM === this.customDOM;
  }
}

export const createBlockWidget = (config: CursorWidgetConfig, pos?: number) => {
  if (typeof pos !== 'number') {
    return Decoration.none;
  }
  return Decoration.set(
    Decoration.widget({
      widget: new CustomDivWidget(config.createDOM()),
      side: config.side,
      block: true,
      config,
    }).range(pos),
  );
};
