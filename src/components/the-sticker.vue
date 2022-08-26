<script lang="ts" setup>
import { onMounted, watch } from 'vue'

import notionFrameURL from '../assets/notion-logo-frame.png'
import useFlag from '../stores/flag'
import { createRenderer, type Renderer } from '../libs/sticker-renderer'

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

const { example } = useFlag()

const SIZE = 512

let canvas = $ref(null as HTMLCanvasElement | null)
let renderer: Renderer

async function render () {
  await renderer?.render(props.text, {
    color: example.value ? '#0cf' : props.color,
    frame: !example.value,
  })
}

watch([props, example], () => render())

onMounted(() => {
  renderer = createRenderer(canvas!, {
    notionFrame: new Promise(resolve => {
      const img = new Image()
      img.src = notionFrameURL
      img.onload = () => resolve(img)
    }),
    beforeRender: ({ font }) => document.fonts.load(font, props.text),
  })
  render()
})

defineExpose({
  canvas: $$(canvas),
})
</script>

<template lang="pug">
canvas(ref="canvas" :width="SIZE" :height="SIZE")
</template>
