//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

export { CursorMirror, SelectionSide } from './cursor-mirror';

export { PositionMirror } from './position-mirror';

export { CursorInlayHint } from './cursor-inlay-hint';

// 使用 Markers & DiagnosticMarkers 代替
// export {
//   Marker,
//   DiagnosticMarker,
//   LineMarker,
// } from './marker'

export {
  Markers,
  DiagnosticMarkers,
  type MarkerDecorationSpec,
  type DiagnosticMarkerDecorationSpec,
} from './markers';

export { Gutter, GutterLineMarker, GutterPlacement } from './gutter';

export { FoldGutter } from './fold-gutter';

export { Placeholder, ActiveLinePlaceholder } from './placeholder';

export { RefElement } from './ref-element';

export { LineWidget } from './line-widget';
export { DiffView } from './diff-view';

export {
  Mention,
  getCurrentMentionReplaceRange,
  type MentionOptions,
  type MentionOpenChangeEvent,
  type MentionSearchEvent,
} from './mention';

export {
  EmbededLineView,
  EmbededLineViewSide,
  type EmbededLineViewRefProps,
} from './embeded-line-view';

export { PrefixElement } from './prefix-element';
