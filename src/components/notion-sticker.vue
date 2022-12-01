<script lang="ts" setup>
import { watch } from 'vue'

import render from '../../shared/renderer'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 512,
  },
  color: {
    type: String,
    default: '#000',
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
  svg = await render(props.text, {
    size: props.size,
    color: props.color,
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
