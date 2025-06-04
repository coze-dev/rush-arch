import { h, defineComponent, onBeforeMount, onUnmounted, Teleport } from 'vue'
import { placeholder } from '@text-editor/extension-placeholder'
import { useInjector } from '@text-editor/vue'

const Placeholder = defineComponent({
  setup(_props, { slots }) {
    const element = document.createElement('span')

    const injector = useInjector()

    let eject: (() => void) | null = null

    onBeforeMount(() => {
      eject = injector.inject([
        placeholder(() => element),
      ])
    })

    onUnmounted(() => {
      if (eject) {
        eject()
      }
    })

    return () => h(Teleport, { to: element }, [
      slots.default ? slots.default() : undefined,
    ])
  },
})

export {
  Placeholder,
}
