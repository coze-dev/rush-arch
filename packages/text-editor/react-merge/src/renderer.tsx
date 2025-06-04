import React, {
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  // from core
  create,
  type EditorPluginSpec,
  type InferEditorAPIFromPlugins,
  type InferValues,
  // from react
  useInjector,
} from '@text-editor/react';
import { type Extension } from '@codemirror/state';
import { type MergeConfig, MergeView } from '@codemirror/merge';

interface SingleEditorProps<T extends EditorPluginSpec<string, any, any>[]> {
  defaultValue?: string;
  options?: Partial<InferValues<T[number]>>;
  extensions?: Extension[];
}
interface InferRendererProps<T extends EditorPluginSpec<string, any, any>[]> {
  domProps?: {
    style?: CSSProperties;
    className?: string;
  };
  mergeConfig?: MergeConfig;
  a: SingleEditorProps<T>;
  b: SingleEditorProps<T>;
  didMount?: (e: {
    a: InferEditorAPIFromPlugins<T>;
    b: InferEditorAPIFromPlugins<T>;
  }) => void;
  children?: ReactNode;
}

function MergeViewRenderer<T extends EditorPluginSpec<string, any, any>[]>(
  props: { plugins: T } & InferRendererProps<T>,
) {
  const {
    plugins,
    mergeConfig,
    a,
    b,
    domProps = {},
    didMount,
    children,
  } = props;

  const ref = useRef(null);
  const apiRef = useRef<any>(null);
  const propsRef = useRef<any>(null);
  const injector = useInjector();
  const mergeConfigRef = useRef(mergeConfig);
  const aRef = useRef(a);
  const bRef = useRef(b);

  aRef.current = a;
  bRef.current = b;
  propsRef.current = props;

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    const config = mergeConfigRef.current ?? {};

    const { getExtensions, createAPI, createOptions, createEvents } = create({
      plugins,
      injector,
    });

    const aOptions = createOptions();
    const aEvents = createEvents();

    const bOptions = createOptions();
    const bEvents = createEvents();

    const mergeView = new MergeView({
      ...config,
      a: {
        doc: a.defaultValue ?? '',
        extensions: [
          ...getExtensions(a.options ?? {}, {
            options: aOptions,
            events: aEvents,
          }),
          ...(a.extensions ?? []),
        ],
      },
      b: {
        doc: b.defaultValue ?? '',
        extensions: [
          ...getExtensions(b.options ?? {}, {
            options: bOptions,
            events: bEvents,
          }),
          ...(b.extensions ?? []),
        ],
      },
      parent: ref.current!,
    });

    const aAPI = createAPI({
      view: mergeView.a,
      options: aOptions,
      events: aEvents,
    });

    const bAPI = createAPI({
      view: mergeView.b,
      options: bOptions,
      events: bEvents,
    });

    apiRef.current = {
      a: aAPI,
      b: bAPI,
    };

    if (typeof didMount === 'function') {
      didMount({ a: aAPI, b: bAPI });
    }

    return () => {
      aAPI.$destroy();
      bAPI.$destroy();
      mergeView.destroy();
    };
  }, []);

  useEffect(() => {
    apiRef.current?.a.$set(props.a.options ?? {});
  }, [props.a.options]);

  useEffect(() => {
    apiRef.current?.b.$set(props.b.options ?? {});
  }, [props.b.options]);

  return (
    <>
      <div {...domProps} ref={ref} />
      {children}
    </>
  );
}

export { MergeViewRenderer };
