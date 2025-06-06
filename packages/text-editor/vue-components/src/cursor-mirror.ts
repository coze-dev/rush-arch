import { defineComponent, onBeforeMount, onMounted, onUnmounted, type PropType } from 'vue';
import { type BuiltinEditorAPI } from '@coze-editor/vue';
import { elementAtPosition, positionElementLayer, SelectionSide } from '@coze-editor/extensions';
import { autoUpdate } from '@floating-ui/dom';

import { useEditorRef, useInjector } from '@coze-editor/vue';

const CursorMirror = defineComponent({
  props: {
    side: String as PropType<SelectionSide>,
    onChange: Function as PropType<() => void>,
    onVisibleChange: Function as PropType<(visible: boolean) => void>,
  },

  setup({ side, onChange, onVisibleChange }, { expose }) {
    const injector = useInjector()
    const editor = useEditorRef<BuiltinEditorAPI>()
    const dom = document.createElement('div')

    expose({ element: dom })

    let eject: (() => void) | null = null
    onBeforeMount(() => {
      eject = injector.inject([
        elementAtPosition.of({
          dom,
          pos: side!,
        }),
        positionElementLayer,
      ])
    })
    onUnmounted(() => {
      if (typeof eject === 'function') {
        eject()
      }
    })

    // watch for position change
    let disposeUpdateWatcher: (() => void) | null = null
    onMounted(() => {
      const floating = document.createElement('div');
      document.body.appendChild(floating);

      const dispose = autoUpdate(dom, floating, () => {
        if (typeof onChange === 'function') {
          onChange()
        }
      }, { animationFrame: true });

      disposeUpdateWatcher = () => {
        document.body.removeChild(floating);
        dispose();
      }
    })
    onUnmounted(() => {
      if (typeof disposeUpdateWatcher === 'function') {
        disposeUpdateWatcher()
        disposeUpdateWatcher = null
      }
    })

    // watch for visible change
    let disposeVisibleWatcher: (() => void) | null = null
    onMounted(() => {
      if (!editor) {
        return;
      }

      const view = editor.value!.$view

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (typeof onVisibleChange === 'function') {
            onVisibleChange(entry.isIntersecting);
          }
        });
      }, {
        root: view.scrollDOM,
        threshold: 0,
      });

      observer.observe(dom);

      disposeVisibleWatcher = () => {
        observer.disconnect()
      }
    })
    onUnmounted(() => {
      if (typeof disposeVisibleWatcher === 'function') {
        disposeVisibleWatcher()
        disposeVisibleWatcher = null
      }
    })

    return {}
  },

  render() {
    return null
  },
})

export {
  CursorMirror,
  SelectionSide,
}
