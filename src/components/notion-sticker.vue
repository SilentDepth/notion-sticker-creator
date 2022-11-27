<script lang="ts" setup>
import { watch } from 'vue'

import sticker from '../../shared/renderer'

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
})

let svg = $ref('')

watch(props, async props => {
  svg = await sticker(props.text, {
    size: props.size,
    color: props.color,
    params: props.params,
  })
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
