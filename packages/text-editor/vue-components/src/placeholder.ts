//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { h, defineComponent, onBeforeMount, onUnmounted, Teleport } from 'vue';
import { useInjector } from '@coze-editor/vue';
import { placeholder } from '@coze-editor/extension-placeholder';

const Placeholder = defineComponent({
  setup(_props, { slots }) {
    const element = document.createElement('span');

    const injector = useInjector();

    let eject: (() => void) | null = null;

    onBeforeMount(() => {
      eject = injector.inject([placeholder(() => element)]);
    });

    onUnmounted(() => {
      if (eject) {
        eject();
      }
    });

    return () =>
      h(Teleport, { to: element }, [
        slots.default ? slots.default() : undefined,
      ]);
  },
});

export { Placeholder };
