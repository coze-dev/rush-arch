//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

export { create } from './editor';
export { createInjector, InjectPosition } from './injector';
export {
  option,
  api,
  event,
  domEventHandler,
  extension,
  EVENT_SILENT,
} from './spec';

export type {
  EditorOptions,
  BuiltinEditorAPI,
  InferEditorAPIFromPlugins,
  InferValues,
} from './editor';

export type { Injector } from './injector';

export type {
  APIContext,
  Core,
  EditorPluginSpec,
  OptionPluginSpec,
  APIPluginSpec,
  EventPluginSpec,
  DOMEventHandlerPluginSpec,
  ExtensionPluginSpec,
  InferEvents,
} from './spec';
