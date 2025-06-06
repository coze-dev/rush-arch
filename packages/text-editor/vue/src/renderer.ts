import { h, defineComponent, Fragment, onMounted, onUnmounted, type PropType, useTemplateRef, watch } from 'vue';
import { useInjector, useSetEditor } from './hooks';
import { create } from '@coze-editor/core';
import type { Extension } from '@codemirror/state';

export default defineComponent({
  props: {
    plugins: Array as PropType<any[]>,
    extensions: Array as PropType<Extension[]>,
    defaultValue: String,
    options: Object as PropType<any>,
  },

  setup(props) {
    const setEditor = useSetEditor()
    const injector = useInjector()
    const domRef = useTemplateRef<HTMLDivElement>('root')

    let instance: any = null

    onMounted(() => {
      const { render } = create({
        plugins: props.plugins ?? [],
        injector,
      })

      const exported = render({
        parent: domRef.value!,
        defaultValue: props.defaultValue,
        options: props.options ?? {},
        extensions: props.extensions,
      });

      watch(() => props.options, (newOptions) => {
        exported.$set(newOptions)
      })

      setEditor(exported)

      instance = exported
    })

    onUnmounted(() => {
      if (instance) {
        instance.$destroy()
      }
    })
  },

  render() {
    return h(Fragment, null, [
      h('div', { ref: 'root' }),
      this.$slots.default ? this.$slots.default() : undefined,
    ])
  },

  inheritAttrs: false,
});
