//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { jsonLeafNodeHover, wordHover } from './tooltip';
import { type HoverConfig, hoverConfigFacet } from './facet';

export { HoverConfig };

export const hoverAction = (hoverConfig: HoverConfig = {}) => [
  hoverConfigFacet.of(hoverConfig),
  hoverConfig.wordHover ? wordHover : [],
  hoverConfig.jsonLeafNodeHover ? jsonLeafNodeHover : [],
];
