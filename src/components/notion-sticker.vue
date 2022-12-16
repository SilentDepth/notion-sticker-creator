<script lang="ts" setup>
import { watch, type PropType } from 'vue'

import createSticker, { type StickerType } from '../../shared/core'

const props = defineProps({
  template: {
    type: String as PropType<StickerType>,
    default: 'phrase',
  },
  params: {
    type: null,
    default: () => ({}),
  },
  debug: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:instance'])

let sticker = $ref<ReturnType<typeof createSticker>>()
let svg = $ref('')

watch($$(sticker), value => {
  emit('update:instance', value)
})

watch(props, async () => {
  sticker = createSticker(props.template, props.params)
  svg = await sticker.render(props.debug)
}, { immediate: true })
</script>

<template lang="pug">
div(v-html="svg")
</template>

<style scoped>
div::v-deep(svg) {
  width: 100% !important;
  height: 100% !important;
}
</style>
