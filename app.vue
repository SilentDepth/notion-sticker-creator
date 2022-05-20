<template lang="pug">
div(class="h-10 flex")
  input(v-model="text" type="text" placeholder="最多四个字符" class="w-32 text-center text-white bg-gray-800 border border-black rounded-md focus:outline-none")
  div(class="relative ml-1 w-16 border border-black rounded-md overflow-hidden" :style="{backgroundColor: color}")
    input(v-model="color" type="color" class="absolute inset-0 w-full h-full opacity-0")

//div(class="flex" style="width: 600px;")
  input(v-model="matrix[0]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[1]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[2]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[3]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[4]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[5]" type="number" class="flex-1 min-w-0")
//input(v-model="fontSize" type="number" style="width: 100px;")

div(class="relative")
  canvas(ref="canvas" :width="size" :height="size" class="invisible" @click="debug")
  img(:src="imgSrc" class="absolute inset-0 w-full h-full")

component(:is="DEBUG_CONTROL")
</template>

<script setup>
import {computed, h, onMounted, reactive} from 'vue'

import frameUrl from './assets/notion-logo-frame.png'

const DEBUG = import.meta.env.PROD ? {} : reactive({
  stopTransform: true,
  showRenderArea: true,
  showCharArea: true,
})
const DEBUG_CONTROL = import.meta.env.PROD ? undefined : {
  render: () => h('div', {class: 'p-4 text-white border border-white rounded flex items-center space-x-4'}, [
    h('label', {class: 'flex items-center'}, [h('input', {checked: DEBUG.stopTransform, type: 'checkbox', class: 'mr-1.5', onChange: ({target: {checked}}) => DEBUG.stopTransform = checked}), 'Render area']),
    h('label', {class: 'flex items-center'}, [h('input', {checked: DEBUG.showRenderArea, type: 'checkbox', class: 'mr-1.5', onChange: ({target: {checked}}) => DEBUG.showRenderArea = checked}), 'Render area']),
    h('label', {class: 'flex items-center'}, [h('input', {checked: DEBUG.showCharArea, type: 'checkbox', class: 'mr-1.5', onChange: ({target: {checked}}) => DEBUG.showCharArea = checked}), 'Char area']),
  ]),
}

let canvas = $ref()
let imgSrc = $ref()
let size = $ref(320)
let color = $ref('#000')
let text = $ref('你好世界')
let matrix = $ref([618, -36, 0, 585, 128, 150])

const fontSize = computed(() => [0, 396, 200, 200, 200][text.length] / 512 * size)
const font = computed(() => `900 ${fontSize.value}px Noto Serif SC`)
const transform = computed(() => matrix.map((n, idx) => idx <= 3 ? n / 1000 : n / 512 * size))

let image

void function () {
  const img = new Image()
  img.src = frameUrl
  img.onload = () => image = img
}()

onMounted(() => {
  render()
})

function render () {
  const {width, height} = canvas
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, width, height)
  ctx.save()

  if (import.meta.env.PORD || !DEBUG.stopTransform) {
    if (image) {
      ctx.drawImage(image, 0, 0, width, height)
    }
  }

  if (import.meta.env.PROD || !DEBUG.stopTransform) {
    ctx.setTransform(...transform.value)
  }
  if (import.meta.env.DEV && DEBUG.showRenderArea) {
    ctx.fillStyle = '#f0f6'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.fillStyle = color
  ctx.font = font.value
  switch (text.length) {
    case 0:
      break
    case 1:
      putText(ctx, text, 'center', width / 2, height / 2)
      break
    case 2:
      putText(ctx, text[0], 'bottom right', width / 2, height / 2)
      putText(ctx, text[1], 'top left', width / 2, height / 2)
      break
    default:
      putText(ctx, text[0], 'bottom right', width / 2, height / 2)
      putText(ctx, text[1], 'bottom left', width / 2, height / 2)
      putText(ctx, text[2], 'top right', width / 2, height / 2)
      putText(ctx, text[3] || '', 'top left', width / 2, height / 2)
  }

  ctx.restore()
  imgSrc = canvas.toDataURL()
  requestAnimationFrame(render)
}

function putText (ctx, ch, origin, x, y) {
  const ox = /left|right/.exec(origin)?.[0] ?? 'center'
  const oy = /top|bottom/.exec(origin)?.[0] ?? 'center'

  ctx.save()
  const rx = {
    left: x,
    center: x - fontSize.value / 2,
    right: x - fontSize.value,
  }[ox]
  const ry = {
    top: y,
    center: y - fontSize.value / 2,
    bottom: y - fontSize.value,
  }[oy]
  if (import.meta.env.DEV && DEBUG.showCharArea) {
    ctx.fillStyle = '#0f0' + [6, 9, 9, 6][text.indexOf(ch) % 4]
    ctx.fillRect(rx, ry, fontSize.value, fontSize.value)
  }
  ctx.restore()

  const {
    actualBoundingBoxLeft: left,
    actualBoundingBoxRight: right,
    actualBoundingBoxAscent: top,
    actualBoundingBoxDescent: bottom,
  } = ctx.measureText(ch)
  const width = left + right
  const height = top + bottom
  const fx = rx + left - width / 2 + fontSize.value / 2
  const fy = ry + top - height / 2 + fontSize.value / 2
  ctx.fillText(ch, fx, fy)

  if (import.meta.env.DEV && DEBUG.showCharArea) {
    ctx.save()
    // ctx.ellipse(fx, fy, 5, 5, 0, 0, 2 * Math.PI)
    // ctx.closePath()
    ctx.fillStyle = '#00f8'
    // ctx.fill()
    ctx.fillRect(fx - left - top, fy + right + bottom, fontSize.value, fontSize.value)
    ctx.restore()
  }
}
</script>
