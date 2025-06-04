/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditorView } from '@codemirror/view';

import { EVENT_SILENT } from './spec';
import type {
  OptionPluginSpec,
  APIPluginSpec,
  EventPluginSpec,
  ExtensionPluginSpec,
  DOMEventHandlerPluginSpec,
} from './spec';
import { OptionHandler } from './options';

const optionPlugin = (spec: OptionPluginSpec<string, any>) => ({
  apply(ctx: any) {
    ctx.hooks.setupOption.tap('option', (params: any) => {
      const { key, options } = params;
      if (key === spec.name) {
        options.add(spec.name, new OptionHandler(spec.handler));
      }
    });
  },
});

const apiPlugin = (spec: APIPluginSpec<string, any>) => ({
  apply(ctx: any) {
    ctx.hooks.extendAPI.tap('api', (params: any) => {
      const { context, api } = params;
      const method = spec.handler(context);
      api[spec.name] = method;
    });
  },
});

const eventPlugin = (spec: EventPluginSpec<string, any>) => ({
  apply(ctx: any) {
    ctx.hooks.addExtension.tap('event', (params: any) => {
      const { events, extensions } = params;
      extensions.push(
        EditorView.updateListener.of(update => {
          const result = spec.handler(update);
          if (result !== EVENT_SILENT) {
            events.emit(spec.name, result);
          }
        }),
      );
    });
  },
});

const domEventHandlerPlugin = (spec: DOMEventHandlerPluginSpec<string>) => ({
  apply(ctx: any) {
    ctx.hooks.addExtension.tap('domEventHandler', (params: any) => {
      const { events, extensions } = params;
      extensions.push(
        EditorView.domEventHandlers({
          [spec.name]: e => {
            events.emit(spec.name, e);
          },
        }),
      );
    });
  },
});

const extensionPlugin = (spec: ExtensionPluginSpec) => ({
  apply(ctx: any) {
    ctx.hooks.addExtension.tap('extension', (params: any) => {
      const { extensions } = params;
      extensions.push(spec.extension);
    });
  },
});

export {
  optionPlugin,
  apiPlugin,
  eventPlugin,
  domEventHandlerPlugin,
  extensionPlugin,
};
