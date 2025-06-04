/* eslint-disable @typescript-eslint/no-explicit-any */
import { type EditorView, type ViewUpdate } from '@codemirror/view';
import { type Extension } from '@codemirror/state';

const EVENT_SILENT = Symbol('event/silent');

interface APIContext {
  view: EditorView;
  get: (key: string) => unknown;
  set: (values: Record<string, unknown>) => void;
}

interface APIPluginSpec<
  Name extends string,
  Params extends any[],
  ReturnValue = unknown,
> {
  type: 'api';
  name: Name;
  handler: (context: APIContext) => (...params: Params) => ReturnValue;
}

interface OptionPluginSpec<Name extends string, Value = unknown> {
  type: 'option';
  name: Name;
  handler: (value: Value) => Extension | undefined;
}

interface EventPluginSpec<Name extends string, Value = unknown> {
  type: 'event';
  name: Name;
  handler: (update: ViewUpdate) => Value | typeof EVENT_SILENT;
}

interface DOMEventHandlerPluginSpec<T extends string> {
  type: 'domEventHandler';
  name: T;
}

interface ExtensionPluginSpec {
  type: 'extension';
  extension: Extension;
}

type EditorPluginSpec<T extends string, U extends any[], V> =
  | APIPluginSpec<T, U, V>
  | OptionPluginSpec<T, U>
  | EventPluginSpec<T, U>
  | DOMEventHandlerPluginSpec<T>
  | ExtensionPluginSpec;

function option<Name extends string, Value>(
  name: Name,
  handler: (value: Value) => Extension,
): OptionPluginSpec<Name, Value> {
  return {
    type: 'option',
    name,
    handler,
  };
}

function api<Name extends string, Params extends any[], ReturnValue>(
  name: Name,
  handler: (context: APIContext) => (...params: Params) => ReturnValue,
): APIPluginSpec<Name, Params, ReturnValue> {
  return {
    type: 'api',
    name,
    handler,
  };
}

function event<Name extends string, Params>(
  name: Name,
  handler: (update: ViewUpdate) => Params | typeof EVENT_SILENT,
): EventPluginSpec<Name, Params> {
  return {
    type: 'event',
    name,
    handler,
  };
}

function domEventHandler<Name extends keyof HTMLElementEventMap>(
  name: Name,
): DOMEventHandlerPluginSpec<Name> {
  return {
    type: 'domEventHandler',
    name,
  };
}

function extension(ext: Extension): ExtensionPluginSpec {
  return {
    type: 'extension',
    extension: ext,
  };
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type InferValues<Plugin extends EditorPluginSpec<string, any, any>> =
  UnionToIntersection<
    Plugin extends OptionPluginSpec<infer Name, infer Value>
      ? { [K in Name]: Value }
      : never
  >;

type InferAPI<Plugin extends EditorPluginSpec<string, any, any>> =
  UnionToIntersection<
    Plugin extends APIPluginSpec<infer Name, infer Params, infer ReturnValue>
      ? { [K in Name]: (...params: Params) => ReturnValue }
      : never
  >;

type InferEvents<Plugin extends EditorPluginSpec<string, any, any>> =
  UnionToIntersection<
    Plugin extends EventPluginSpec<infer Name, infer Params>
      ? { [K in Name]: Params }
      : Plugin extends DOMEventHandlerPluginSpec<infer Name>
        ? Name extends keyof HTMLElementEventMap
          ? { [K in Name]: HTMLElementEventMap[Name] }
          : { [K in Name]: unknown }
        : never
  >;

interface Core {
  API: typeof api;
  Extesion: typeof extension;
  Event: typeof event;
  Option: typeof option;
}

export { option, api, event, domEventHandler, extension, EVENT_SILENT };

export type {
  EditorPluginSpec,
  OptionPluginSpec,
  APIPluginSpec,
  EventPluginSpec,
  DOMEventHandlerPluginSpec,
  ExtensionPluginSpec,
  APIContext,
  InferValues,
  InferAPI,
  InferEvents,
  Core,
};
