//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useInjectorEffect, useLatest } from '@coze-editor/react-hooks';

import { type MentionOptions } from './types';
import { hasTrigger } from './is';
import { mention, getCurrentMentionReplaceRange } from './extension';

function Mention(props: MentionOptions) {
  const propsRef = useLatest(props);

  useInjectorEffect(injector => {
    const sharedOptions: Partial<MentionOptions> = {
      search: props.search,
      onOpenChange(...args) {
        if (typeof propsRef.current.onOpenChange === 'function') {
          return propsRef.current.onOpenChange(...args);
        }
      },
      onSearch(...args) {
        if (typeof propsRef.current.onSearch === 'function') {
          return propsRef.current.onSearch(...args);
        }
      },
    };
    return injector.inject([
      mention(
        hasTrigger(props)
          ? {
              ...sharedOptions,
              trigger(tr) {
                if (hasTrigger(propsRef.current)) {
                  return propsRef.current.trigger(tr);
                }
              },
            }
          : {
              ...sharedOptions,
              triggerCharacters: props.triggerCharacters ?? [],
            },
      ),
    ]);
  });

  return null;
}

export { Mention, getCurrentMentionReplaceRange };

export type { MentionOptions };
