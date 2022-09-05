<script lang="ts" setup>
import { onMounted, watch } from 'vue'

import notionFrameURL from '../assets/notion-logo-frame.png'
import useFlag from '../stores/flag'
import { createRenderer, type Renderer } from '@notion-sticker-creator/core'

const DEV = import.meta.env.DEV

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

const { example } = $(useFlag())

const SIZE = 512

let canvas = $ref(null as HTMLCanvasElement | null)
let renderer: Renderer

async function render () {
  await renderer?.render(props.text, {
    color: example ? '#0cf' : props.color,
    frame: !example,
  })
}

watch([props, $$(example)], () => render())

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
div(class="relative")
  //img(v-if="example" src="../assets/sticker-4.webp" class="absolute w-[256px] h-[256px]")
  canvas(ref="canvas" :width="SIZE" :height="SIZE" :class="['w-[256px] h-[256px]', { 'relative mix-blend-difference': example }]")
  div(v-if="DEV" class="mt-4 text-white")
    label(class="flex justify-center items-center")
      input(v-model="example" type="checkbox")
      span(class="ml-1") Example
</template>
