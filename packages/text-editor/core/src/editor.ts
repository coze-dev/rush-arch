/* eslint-disable default-case */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import mitt, { type EventType, type Emitter } from 'mitt';
import { EditorView } from '@codemirror/view';
import { EditorState, type Extension } from '@codemirror/state';

import {
  type EditorPluginSpec,
  type InferValues,
  type InferEvents,
  type InferAPI,
} from './spec';
import {
  apiPlugin,
  domEventHandlerPlugin,
  eventPlugin,
  extensionPlugin,
  optionPlugin,
} from './plugins';
import { Options } from './options';
import { InjectPosition, type Injector, createInjector } from './injector';
import { createSyncHook } from './hook';
import { disableEditContext } from './disable-edit-context';

disableEditContext();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface EditorOptions<T, U> {
  parent: HTMLElement;
  root?: Document | ShadowRoot;
  defaultValue?: string;
  options: T;
  extensions?: Extension[];
}

type InferOnOff<Events> = <K extends keyof Events>(
  eventName: K,
  handler: (params: Events[K]) => void,
) => void;

type InferEventMap<Events> = {
  [K in keyof Events]: (params: Events[K]) => void;
};

type InferGet<Values> = <K extends keyof Values>(
  key: K,
) => Values[K] | undefined;

type InferSet<Values> = (values: Values) => void;

interface InitOptionHookParams {
  key: string;
  options: Options;
}

interface ExtendAPIHookParams<Values> {
  context: {
    view: EditorView;
    get: (key: keyof Values) => Values[keyof Values];
    set: (values: Values) => void;
  };
}

interface AddExtensionHookParams {
  events: Emitter<any>;
  extensions: Extension[];
}

interface BuiltinEditorAPI {
  $view: EditorView;
  $on: (name: string, handler: Function) => void;
  $off: (name: string, handler: Function) => void;
  $get: (key: string) => unknown;
  $set: (key: string, value: unknown) => void;
  $destroy: () => void;
  $inject: (extension: Extension, position?: InjectPosition) => () => void;
}

type InferEditorAPIFromPlugins<
  T extends EditorPluginSpec<string, any, any>[],
  Events = InferEvents<T[number]>,
  AllValues = InferValues<T[number]>,
  Values = Partial<AllValues>,
> = InferAPI<T[number]> & { $on: InferOnOff<Events> } & {
  $off: InferOnOff<Events>;
} & { $get: InferGet<AllValues> } & { $set: InferSet<Values> } & Pick<
    BuiltinEditorAPI,
    '$view' | '$destroy' | '$inject'
  > & { __private_eventmap: InferEventMap<Events> };

function create<T extends EditorPluginSpec<string, any, any>[]>({
  plugins,
  injector = createInjector(),
}: {
  plugins: T;
  injector?: Injector;
}) {
  type AllValues = InferValues<T[number]>;
  type Values = Partial<AllValues>;
  type Events = InferEvents<T[number]>;
  type API = InferEditorAPIFromPlugins<T>;

  const hooks = {
    extendAPI: createSyncHook<ExtendAPIHookParams<Values>>(),
    setupOption: createSyncHook<InitOptionHookParams>(),
    addExtension: createSyncHook<AddExtensionHookParams>(),
  };

  const ctx = { hooks };

  const optionKeys: string[] = [];
  const eventKeys: string[] = [];
  plugins.forEach(plugin => {
    switch (plugin.type) {
      case 'option':
        optionKeys.push(plugin.name);
        optionPlugin(plugin).apply(ctx);
        break;
      case 'api':
        apiPlugin(plugin).apply(ctx);
        break;
      case 'event':
        eventKeys.push(plugin.name);
        eventPlugin(plugin).apply(ctx);
        break;
      case 'domEventHandler':
        eventKeys.push(plugin.name);
        domEventHandlerPlugin(plugin).apply(ctx);
        break;
      case 'extension':
        extensionPlugin(plugin).apply(ctx);
        break;
    }
  });

  function getExtensions(
    values: EditorOptions<Values, Events>['options'],
    {
      options,
      events,
    }: {
      options: Options;
      events: Emitter<Record<string, unknown>>;
    },
  ): Extension[] {
    optionKeys.forEach(key => {
      hooks.setupOption.call({
        key,
        options,
      });
    });

    const extensions: Extension[] = [];
    hooks.addExtension.call({
      events,
      extensions,
    });

    return [
      injector.getCompartment(InjectPosition.Head),
      ...options.init(values),
      ...extensions,
      injector.getCompartment(InjectPosition.Tail),
    ];
  }

  function createOptions() {
    return new Options();
  }

  function createEvents() {
    return mitt();
  }

  function createAPI({
    view,
    options,
    events,
  }: {
    view: EditorView;
    options: Options;
    events: Emitter<Record<EventType, unknown>>;
  }): API {
    function setOptions(optValues: Values) {
      const effects = options.set(optValues);
      // values unchanged
      if (effects.length === 0) {
        return;
      }
      view.dispatch({ effects });
    }

    function getOption<K extends keyof AllValues>(key: K): AllValues[K] {
      return options.get(key);
    }

    const context = {
      view,
      set: setOptions,
      get: getOption,
    };

    const api: API = Object.create(null);

    hooks.extendAPI.call({
      context,
      api,
    });

    api.$view = view;
    api.$on = events.on.bind(events);
    api.$off = events.off.bind(events);
    api.$get = getOption;
    api.$set = setOptions;
    api.$inject = injector.inject.bind(injector);
    api.$destroy = () => {
      view.destroy();
      events.off('*');
    };

    return api;
  }

  function render(opts: EditorOptions<Values, Events>): API {
    const { parent, root, defaultValue } = opts;
    let { extensions: userExtensions } = opts;

    if (!Array.isArray(userExtensions)) {
      userExtensions = [];
    }

    const options = createOptions();
    const events = createEvents();

    const extensions = getExtensions(opts.options, {
      options,
      events,
    });

    const view = new EditorView({
      parent,
      root,
      state: EditorState.create({
        doc: defaultValue ?? '',
        extensions: [...extensions, ...userExtensions],
      }),
    });

    injector.provideView(view);

    const api = createAPI({
      view,
      options,
      events,
    });

    return api;
  }

  return {
    render,
    getExtensions,
    createAPI,
    createOptions,
    createEvents,
    eventKeys,
  };
}

export { create };

export type {
  EditorOptions,
  BuiltinEditorAPI,
  InferValues,
  InferEditorAPIFromPlugins,
};
