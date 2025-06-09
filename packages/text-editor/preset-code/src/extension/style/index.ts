//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { EditorView } from '@codemirror/view';

interface PropsType {
  height?: number | string;
  width?: number | string;
}

const isNumber = (value: unknown): value is number => typeof value === 'number';

export const style = ({ height, width }: PropsType) => {
  const sizeStyle: {
    [key in keyof PropsType]: string;
  } = {};

  if (width) {
    sizeStyle.width = isNumber(width) ? `${width}px` : width;
  }

  if (height) {
    sizeStyle.height = isNumber(height) ? `${height}px` : height;
  }

  return EditorView.theme({
    '&.cm-editor': sizeStyle,
  });
};
