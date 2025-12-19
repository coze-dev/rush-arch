//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import React, { useMemo } from 'react';

import { type EditorPluginSpec } from '@coze-editor/core';
import { type Extension } from '@codemirror/state';

import { Renderer, type InferRendererProps } from './renderer';

const OriginRenderer: (props: any) => JSX.Element = Renderer;

interface CreateRendererOptions<T> {
  defaultOptions?: T;
}

function createRenderer<
  T extends EditorPluginSpec<string, any, any>[],
  U extends InferRendererProps<T> = InferRendererProps<T>,
>(plugins: T, options?: Extension[] | CreateRendererOptions<U['options']>) {
  let builtinExtensions: Extension[] = [];
  let defaultOptions = {};

  // 兼容历史类型
  if (Array.isArray(options)) {
    builtinExtensions = options;
  } else if (options && typeof options === 'object') {
    defaultOptions = options.defaultOptions ?? {};
  }

  return function CustomRenderer(props: InferRendererProps<T>) {
    const userExtensions = props.extensions;

    const extensions: Extension[] = useMemo(
      () => [...(builtinExtensions ?? []), ...(userExtensions ?? [])],
      [userExtensions],
    );

    return (
      <OriginRenderer
        {...props}
        options={{
          ...defaultOptions,
          ...(props.options ?? {}),
        }}
        extensions={extensions}
        plugins={plugins}
      />
    );
  };
}

export { createRenderer };
export type { CreateRendererOptions };
