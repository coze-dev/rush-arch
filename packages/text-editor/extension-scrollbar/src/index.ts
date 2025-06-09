//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  OverlayScrollbars,
  ScrollbarsHidingPlugin,
  SizeObserverPlugin,
  ClickScrollPlugin,
} from 'overlayscrollbars';
import { EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { type Extension } from '@codemirror/state';
import 'overlayscrollbars/overlayscrollbars.css';
import './index.css';

OverlayScrollbars.plugin([
  ScrollbarsHidingPlugin,
  SizeObserverPlugin,
  ClickScrollPlugin,
]);

interface ScrollbarOptions {
  autoHideDelay?: number;
}

function getThemeName(isDark: boolean) {
  return isDark ? 'os-theme-codemirror-dark' : 'os-theme-codemirror';
}

function preventDefault(e: MouseEvent) {
  e.preventDefault();
}

const scrollbar = (options?: ScrollbarOptions): Extension =>
  ViewPlugin.fromClass(
    class {
      private instance: OverlayScrollbars;

      constructor(view: EditorView) {
        const isDark = view.state.facet(EditorView.darkTheme);

        this.instance = OverlayScrollbars(
          {
            target: view.scrollDOM,
            elements: {
              viewport: view.scrollDOM,
              padding: view.dom.querySelector('.cm-gutters') as HTMLElement,
            },
          },
          {
            overflow: {
              y: 'scroll',
              x: 'scroll',
            },
            scrollbars: {
              theme: getThemeName(isDark),
              visibility: 'auto',
              autoHide: 'scroll',
              autoHideDelay: options?.autoHideDelay ?? 1500,
              dragScroll: true,
              clickScroll: true,
              pointers: ['mouse', 'touch', 'pen'],
            },
          },
        );

        this.instance
          .elements()
          .scrollbarVertical.handle.addEventListener(
            'mousedown',
            preventDefault,
            false,
          );
        this.instance
          .elements()
          .scrollbarHorizontal.handle.addEventListener(
            'mousedown',
            preventDefault,
            false,
          );
      }

      update(update: ViewUpdate) {
        const isDark = update.view.state.facet(EditorView.darkTheme);

        const newTheme = getThemeName(isDark);
        const existingOptions = this.instance.options();

        if (existingOptions.scrollbars.theme !== newTheme) {
          this.instance.options({
            scrollbars: {
              theme: newTheme,
            },
          });
        }
      }

      destroy() {
        this.instance
          .elements()
          .scrollbarVertical.handle.removeEventListener(
            'mousedown',
            preventDefault,
            false,
          );
        this.instance
          .elements()
          .scrollbarHorizontal.handle.removeEventListener(
            'mousedown',
            preventDefault,
            false,
          );
        this.instance.destroy();
      }
    },
  );

export { scrollbar };
