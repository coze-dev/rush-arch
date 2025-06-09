//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { type Extension, Prec } from '@codemirror/state';

export interface Link {
  target: string;
  range: {
    from: number;
    to: number;
  };
}
export type LinksProvider = (view: EditorView) => Promise<Link[]>;

async function decorateURL(
  view: EditorView,
  linksProvider: LinksProvider,
): Promise<DecorationSet> {
  const links = await linksProvider(view);

  let set = Decoration.none;
  set = set.update({
    add: links.map(({ target, range }) =>
      Decoration.mark({
        class: 'cm-link',
        attributes: {
          'data-link': target,
        },
      }).range(range.from, range.to),
    ),
  });

  return set;
}

const view = (linksProvider: LinksProvider, delay: number): Extension => [
  ViewPlugin.fromClass(
    class {
      private controller: AbortController | null = null;
      public decorations: DecorationSet = Decoration.none;

      constructor(view: EditorView) {
        this.schedule(view);
      }

      private schedule(view: EditorView) {
        if (this.controller) {
          this.controller.abort();
          this.controller = null;
        }

        const controller = new AbortController();
        const { signal } = controller;
        this.controller = controller;

        setTimeout(() => {
          if (signal.aborted) {
            return;
          }

          decorateURL(view, linksProvider).then(decorations => {
            if (signal.aborted) {
              return;
            }

            this.decorations = decorations;

            view.dispatch({
              userEvent: 'sdk.links.update',
            });

            this.controller = null;
          });
        }, delay);
      }

      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.decorations = this.decorations.map(update.changes);
          this.schedule(update.view);
        }
      }
    },
    {
      provide(plugin) {
        // 优先级设置为最高，decoration 出现在最里面
        return Prec.highest(
          EditorView.decorations.of(
            view => view.plugin(plugin)?.decorations ?? Decoration.none,
          ),
        );
      },
    },
  ),
];

function links(linksProvider: LinksProvider, delay = 500) {
  return [view(linksProvider, delay)];
}

export { links };
