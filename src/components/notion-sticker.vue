<script lang="ts" setup>
import { type PropType, useAttrs, watch } from 'vue'

import render, { type Template } from '../../shared/renderer'

const props = defineProps({
  input: {
    type: null,
    default: '',
  },
  size: {
    type: Number,
    default: 512,
  },
  template: {
    type: String as PropType<Template>,
    default: undefined,
  },
  debug: {
    type: Boolean,
    default: false,
  },
})

const attrs = useAttrs()

let svg = $ref('')

watch(() => [props, attrs], async () => {
  svg = await render(props.input, {
    size: props.size,
    template: props.template,
    ...attrs,
  }, props.debug)
}, { immediate: true, deep: true })
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
