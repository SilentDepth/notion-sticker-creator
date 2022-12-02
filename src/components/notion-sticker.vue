<script lang="ts" setup>
import { type PropType, watch } from 'vue'

import render from '../../shared/renderer'
import { type Template } from '../../shared/renderer/sticker'

const props = defineProps({
  input: {
    type: String,
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
  params: {
    type: Object,
    default: undefined,
  },
  debug: {
    type: Boolean,
    default: false,
  },
})

let svg = $ref('')

watch(props, async props => {
  svg = await render(props.input, {
    size: props.size,
    template: props.template,
    ...props.params,
  }, props.debug)
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
