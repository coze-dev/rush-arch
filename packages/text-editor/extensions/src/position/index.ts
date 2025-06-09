//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  Direction,
  type EditorView,
  type LayerMarker,
  type ViewUpdate,
  layer,
} from '@codemirror/view';
import { Facet } from '@codemirror/state';

enum SelectionSide {
  Head = 'head',
  Anchor = 'anchor',
}

interface PositionElement {
  dom: HTMLElement | null;
  pos: SelectionSide | number | ((view: EditorView) => number);
}
const elementAtPosition = Facet.define<PositionElement, PositionElement[]>();

function configChanged(update: ViewUpdate) {
  return (
    update.startState.facet(elementAtPosition) !==
    update.state.facet(elementAtPosition)
  );
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

class PositionMarker implements LayerMarker {
  constructor(
    public readonly dom: HTMLElement,
    public readonly rect?: Rect,
  ) {}

  eq(marker: PositionMarker) {
    return Boolean(
      ((!this.rect && !marker.rect) ||
        (this.rect &&
          marker.rect &&
          this.rect.left === marker.rect.left &&
          this.rect.top === marker.rect.top &&
          this.rect.width === marker.rect.width &&
          this.rect.height === marker.rect.height)) &&
        this.dom === marker.dom,
    );
  }

  draw() {
    this.adjust(this.dom);
    return this.dom;
  }

  update() {
    this.adjust(this.dom);
    return true;
  }

  private adjust(elt: HTMLElement) {
    elt.style.pointerEvents = 'none';

    if (!this.rect) {
      return;
    }
    elt.style.left = `${this.rect.left}px`;
    elt.style.top = `${this.rect.top}px`;
    elt.style.width = `${this.rect.width}px`;
    elt.style.height = `${this.rect.height}px`;
  }
}

function getBase(view: EditorView) {
  const rect = view.scrollDOM.getBoundingClientRect();
  const left =
    view.textDirection === Direction.LTR
      ? rect.left
      : rect.right - view.scrollDOM.clientWidth * view.scaleX;
  return {
    left: left - view.scrollDOM.scrollLeft * view.scaleX,
    top: rect.top - view.scrollDOM.scrollTop * view.scaleY,
  };
}

const positionElementLayer = layer({
  above: true,

  markers(view: EditorView) {
    const elements = view.state.facet(elementAtPosition);

    if (!elements || elements.length === 0) {
      return [];
    }

    const base = getBase(view);

    const temp: any[] = [];

    const markers: PositionMarker[] = [];
    for (const { dom, pos } of elements) {
      if (!dom) {
        continue;
      }

      let finalPos = -1;

      if (typeof pos === 'function') {
        finalPos = pos(view);
      } else if (typeof pos === 'number') {
        finalPos = pos;
      } else if (pos === SelectionSide.Head) {
        finalPos = view.state.selection.main.head;
      } else if (pos === SelectionSide.Anchor) {
        finalPos = view.state.selection.main.anchor;
      }

      const coords = view.coordsAtPos(finalPos);

      // 由于 codemirror 实现了局部渲染，可能取不到 coords
      if (coords) {
        temp.push(coords);

        const width = 1;
        const left = coords.left - base.left - width / 2;
        const top = coords.top - base.top;
        const height = coords.bottom - coords.top;

        markers.push(new PositionMarker(dom, { left, top, width, height }));
      } else {
        markers.push(new PositionMarker(dom));
      }
    }

    return markers;
  },

  update(update) {
    return (
      update.docChanged ||
      update.selectionSet ||
      update.viewportChanged ||
      configChanged(update)
    );
  },

  class: 'cm-positionReferenceLayer',
});

export { elementAtPosition, positionElementLayer, SelectionSide };

export type { PositionElement };
