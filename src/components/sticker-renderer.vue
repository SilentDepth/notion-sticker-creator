<script setup>
import { onMounted, watch } from 'vue'

import useFlag from '../stores/flag'
import { render } from '../libs/sticker'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#000',
  },
})

const emit = defineEmits(['update'])

const { example } = useFlag()

const SIZE = 512

/** @type {HTMLCanvasElement} */
let canvas = $ref(null)

async function _render () {
  await render(canvas, props.text, {
    color: props.color,
  })
  emit('update', canvas.toDataURL('image/webp'))
}

watch([props, example], () => _render())

onMounted(() => {
  _render()
})
</script>

<template lang="pug">
canvas(ref="canvas" :width="SIZE" :height="SIZE")
</template>
