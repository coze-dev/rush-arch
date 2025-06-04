/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  type EditorPluginSpec,
  type InferEditorAPIFromPlugins,
  type InferEvents,
  type InferValues,
  create,
} from '@text-editor/core';
import { type Extension } from '@codemirror/state';

import { useInjector, useSetEditor } from './provider';

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type InferReactEvents<T extends Record<string, any>> = UnionToIntersection<{
  [K in keyof T as `on${Capitalize<string & K>}`]?: (e: T[K]) => void;
}>;

function firstLetterToUppercase(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

type InferRendererProps<T extends EditorPluginSpec<string, any, any>[]> = {
  domProps?: {
    style?: CSSProperties;
    className?: string;
  };
  defaultValue?: string;
  options?: Partial<InferValues<T[number]>>;
  extensions?: Extension[];
  didMount?: (api: InferEditorAPIFromPlugins<T>) => void;
  children?: ReactNode;
} & (InferEvents<T[number]> extends Record<string, any>
  ? InferReactEvents<InferEvents<T[number]>>
  : unknown);

function Renderer<T extends EditorPluginSpec<string, any, any>[]>(
  props: { plugins: T } & InferRendererProps<T>,
) {
  const {
    plugins,
    defaultValue,
    options,
    domProps = {},
    extensions,
    didMount,
    children,
  } = props;

  const [api, setAPI] = useState<any>();
  const ref = useRef(null);
  const apiRef = useRef<any>(null);
  const propsRef = useRef<typeof props | null>(null);
  const setEditor = useSetEditor();
  const injector = useInjector();

  propsRef.current = props;

  useEffect(() => {
    const { render, eventKeys } = create({
      plugins,
      injector,
    });

    const exported = render({
      parent: ref.current!,
      defaultValue,
      options: options ?? {},
      extensions,
    });

    apiRef.current = exported;

    eventKeys.forEach((eventName: any) => {
      exported.$on(eventName, e => {
        const handler = (propsRef.current as any)?.[
          `on${firstLetterToUppercase(eventName)}`
        ];
        if (typeof handler === 'function') {
          handler(e);
        }
      });
    });

    if (typeof didMount === 'function') {
      didMount(exported);
    }

    setAPI(exported);

    return () => {
      exported.$destroy();
    };
  }, []);

  useEffect(() => {
    if (!api || !setEditor) {
      return;
    }

    setEditor(api);
  }, [api, setEditor]);

  useEffect(() => {
    apiRef.current.$set(props.options ?? {});
  }, [props.options]);

  return (
    <>
      <div {...domProps} ref={ref} />
      {children}
    </>
  );
}

export { Renderer };

export type { InferRendererProps };
