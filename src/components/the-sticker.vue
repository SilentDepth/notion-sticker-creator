<script setup>
import { onMounted, watch } from 'vue'

import notionFrameURL from '../assets/notion-logo-frame.png'
import useFlag from '../stores/flag'
import { createRenderer } from '../libs/sticker-renderer'

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
let renderer

async function render () {
  await renderer?.render(props.text, {
    color: example.value ? '#0cf' : props.color,
    frame: !example.value,
  })
  canvas && emit('update', canvas.toDataURL('image/webp'))
}

watch([props, example], () => render())

onMounted(() => {
  renderer = createRenderer(canvas, {
    notionFrame: new Promise(resolve => {
      const img = new Image()
      img.src = notionFrameURL
      img.onload = () => resolve(img)
    }),
    beforeRender: ({ font }) => document.fonts.load(font, props.text),
  })
  render()
})
</script>

<template lang="pug">
canvas(ref="canvas" :width="SIZE" :height="SIZE")
</template>
