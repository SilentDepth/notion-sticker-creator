<script lang="ts" setup>
import { reactive, watch } from 'vue'

import NotionSticker from './components/notion-sticker.vue'
import example from './assets/sticker.webp'

let sticker = $ref<typeof NotionSticker>()

let text = $ref('天地玄黄')
let diff = $ref(false)
const params = reactive({
  fontSize: 238,
  lineHeight: 100,
  translate: [147, 31],
  skewY: -0.070,
})

let canvas = $ref<HTMLCanvasElement>()

watch([$$(canvas), $$(text)], async ([canvas]) => {
  if (!canvas) return

  await new Promise<void>(resolve => {
    if (sticker!.$el.children.length) {
      resolve()
    } else {
      const int = setInterval(() => {
        if (sticker!.$el.children.length) {
          clearInterval(int)
          resolve()
        }
      }, 100)
    }
  })
  const $image = sticker!.$el.querySelector('image')!
  const $paths = sticker!.$el.querySelectorAll('path')
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.drawImage($image, 0, 0)
  for (const $path of $paths) {
    ctx.save()
    const path = new Path2D($path.getAttribute('d'))
    ctx.transform(...$path.getAttribute('transform').slice('matrix('.length, -1).split(',').map((n: string) => +n) as [number, number, number, number, number, number])
    ctx.fillStyle = $path.getAttribute('fill')
    ctx.fill(path)
    ctx.restore()
  }
  ctx.restore()
})
</script>

<template lang="pug">
div(class="min-h-screen bg-gray-800 text-gray-400 flex flex-col justify-center items-center gap-4")
  div(class="flex items-start gap-1")
    div(class="relative" @click="diff = !diff")
      img(v-show="diff" :src="example" class="absolute z-0")
      NotionSticker(
        ref="sticker"
        :text="text"
        :color="diff ? '#f0f' : undefined"
        :params="diff ? params : undefined"
        debug
        :class="{ 'mix-blend-difference': diff }"
      )
    canvas(ref="canvas" width="512" height="512")
  input(v-model="text" type="text")
  div(class="flex items-start gap-2")
    label(class="flex flex-col gap-2")
      code fontSize
      input(v-model="params.fontSize" type="number")
    label(class="flex flex-col gap-2")
      code lineHeight
      input(v-model="params.lineHeight" type="number")
    label(class="flex flex-col gap-2")
      code translateX
      input(v-model="params.translate[0]" type="number")
    label(class="flex flex-col gap-2")
      code translateY
      input(v-model="params.translate[1]" type="number")
    label(class="flex flex-col gap-2")
      code skewY
      input(:value="params.skewY * 1000" type="number" @change="params.skewY = $event.target.value / 1000")
</template>

<style scoped>
input {
  padding: 0 4px;
  color: black;
}
</style>
