//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type EditorView } from '@codemirror/view';
import { Facet } from '@codemirror/state';

export interface HoverConfig {
  wordHover?: boolean;
  jsonLeafNodeHover?: boolean;
  renderPanel?: (textContent: string, view: EditorView) => HTMLElement;
}

export const hoverConfigFacet = Facet.define<HoverConfig, HoverConfig>({
  combine(value) {
    return value[value.length - 1] || {};
  },
});
