import { h, defineComponent } from 'vue'
import { useEditorProvider } from './hooks'

export default defineComponent({
  setup() {
    useEditorProvider()
  },

  render() {
    return h('div', null, [
      this.$slots.default ? this.$slots.default() : undefined,
    ])
  },
});