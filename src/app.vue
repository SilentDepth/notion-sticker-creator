<script lang="ts" setup>
import { watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

import NotionSticker from './components/notion-sticker.vue'
import ColorInput from './components/color-input.vue'
import AsyncButton from './components/async-button.vue'
import { supportCanvasWebpDataURL } from './libs/feature-detect'

const MAX = 9

let sticker = $ref<typeof NotionSticker>()
let text = $ref('你好世界')
let colors = $ref(['#000000'])
let multiColor = $ref(false)
const stickerColor = $computed(() => multiColor ? colors.join(',') : colors[0])

const graphemes = $computed(() => Intl.Segmenter ? [...new Intl.Segmenter().segment(text)] : text.split(''))
const colorMatrixSize = $computed(() => multiColor ? Math.ceil(Math.sqrt(graphemes.length)) : 1)
const colorMatrixStyle = $computed(() => ({
  gridTemplateRows: `repeat(${colorMatrixSize}, 40px)`,
  gridTemplateColumns: `repeat(${colorMatrixSize}, 40px)`,
}))

watch($$(multiColor), value => {
  if (!value) {
    colors.splice(1, Infinity)
  } else {
    colors.push('')
  }
})

function generateCanvas ($svg: SVGSVGElement) {
  const $image = $svg.querySelector('image')!
  // Safari seems not support drawImage with a SVGImageElement. So we need recreating
  // a compatible HTMLImageElement to do the work.
  const $img = new Image()
  $img.src = $image.getAttribute('href')!

  const $paths = $svg.querySelectorAll('path')

  const canvas = document.createElement('canvas')
  canvas.width = Number($svg.getAttribute('width'))
  canvas.height = Number($svg.getAttribute('height'))
  const ctx = canvas.getContext('2d')!
  ctx.drawImage($img, 0, 0)
  for (const $path of $paths) {
    ctx.save()
    type Matrix = [number, number, number, number, number, number]
    ctx.transform(...$path.getAttribute('transform')!.slice('matrix('.length, -1).split(',').map((n: string) => Number(n)) as Matrix)
    ctx.fillStyle = $path.getAttribute('fill')!
    ctx.fill(new Path2D($path.getAttribute('d')!))
    ctx.restore()
  }

  return canvas
}

function download (format: string) {
  const a = document.createElement('a')
  a.href = supportCanvasWebpDataURL()
    ? generateCanvas(sticker!.$el.querySelector('svg')).toDataURL(`image/${format}`)
    : `/api/sticker/${encodeURIComponent(text)}.webp?color=${encodeURIComponent(stickerColor)}`
  a.download = `notion-sticker.${format}`
  a.click()
  a.remove()
}

async function copy (format: string) {
  const type = `image/${format}`
  const blob = await new Promise<Blob>(resolve => generateCanvas(sticker!.$el.querySelector('svg')).toBlob(resolve, type))
  const data = [new ClipboardItem({ [type]: blob })]
  await navigator.clipboard.write(data)
}

async function copyCommand () {
  const command = [
    // TODO: Extract bot username as env
    '@NotionStickerBot',
    text.replaceAll(/([ =\\])/g, '\\$1'),
    'color=' + colors.map(c => c === '#000000' ? '' : c).join(',').replace(/^,+$/, ''),
  ].filter(Boolean).join(' ')
  await navigator.clipboard.writeText(command)
}

// Show border when the sticker goes sticky

let stickyRef = $ref<HTMLDivElement>()
let isStickyTriggered = $ref(false)

useIntersectionObserver($$(stickyRef), ([{ isIntersecting }]) => {
  isStickyTriggered = !isIntersecting
})
</script>

<template lang="pug">
div(class="min-h-screen py-10 bg-black flex flex-col items-center space-y-5")
  div(class="text-xl text-white")
    img(src="/icon.png" class="mx-auto" style="width: 64px; height: 64px;")
    h1(class="mt-2 font-bold text-center" style="font-family: 'Noto Serif SC';") Notion 贴纸生成器

  div(ref="stickyRef" class="translate-y-5" style="margin: 0; height: 0")
  div(:class="['w-full py-5 bg-black/50 backdrop-blur border-b transition duration-200 sticky top-0 z-1', isStickyTriggered ? 'border-neutral-800' : 'border-transparent']")
    NotionSticker(ref="sticker" :input="text" :color="stickerColor" class="mx-auto" style="width: 256px; height: 256px;")

  p(class="text-neutral-400") 1. 输入贴纸文字（最多 {{ MAX }} 个字符）
  input(v-model="text" type="text" class="flex-none box-content w-[9em] px-[1em] py-[0.25em] text-lg bg-neutral-800 text-white border border-neutral-600 rounded outline-none text-center focus:border-neutral-500")

  p(class="text-neutral-400") 2. 设置文字颜色
  div(class="grid gap-px" :style="colorMatrixStyle")
    ColorInput(
      v-for="n of colorMatrixSize ** 2"
      :key="n"
      v-model="colors[n - 1]"
      :disabled="n > graphemes.length || graphemes[n - 1].segment === ' '"
      :class="['border border-neutral-600', { 'rounded-tl': n === 1, 'rounded-tr': n === colorMatrixSize, 'rounded-bl': n === colorMatrixSize * (colorMatrixSize - 1) + 1, 'rounded-br': n === colorMatrixSize ** 2 }]"
      disabled-class="border-neutral-800"
    )
  label(class="mt-2! flex items-center")
    input(v-model="multiColor" type="checkbox" class="mr-2")
    span(class="text-neutral-200") 逐字设定颜色

  p(class="text-neutral-400") 3. 获取图像
  div(class="grid grid-cols-[auto_1fr_1fr] items-center gap-y-5")
    span(class="mr-4 text-neutral-200") PNG 格式
    button(type="button" class="px-[1em] py-[0.25em] bg-blue-600 text-white rounded-l hover:bg-blue-500 mr-px" @click="download('png')") 下载
    AsyncButton(type="button" class="flex-none px-[1em] py-[0.25em] bg-blue-600 text-white rounded-r hover:bg-blue-500" @click="copy('png')")
      template(#default="{ done }")
        span(:class="['transition duration-200', { 'opacity-0': done }]") 复制
      template(#async)
        svg(viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 absolute inset-0 m-auto")
          path(d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z")
    span(class="mr-4 text-neutral-200") WebP 格式
    button(type="button" class="col-span-2 px-[1em] py-[0.25em] bg-blue-600 text-white rounded hover:bg-blue-500 mr-px" @click="download('webp')") 下载
    //- button(type="button" class="px-[1em] py-[0.25em] bg-blue-600 text-white rounded-r hover:bg-blue-500" @click="copy('webp')") 复制
    span(class="mr-4 text-neutral-200") Bot 命令
    AsyncButton(type="button" :disabled="!text" class="col-span-2 px-[1em] py-[0.25em] bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600! text-white disabled:text-opacity-50 rounded" @click="copyCommand")
      template(#default="{ done }")
        span(:class="['transition duration-200', { 'opacity-0': done }]") 复制
      template(#async)
        svg(viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 absolute inset-0 m-auto")
          path(d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z")

  div(class="mt-10!")
    a(href="https://github.com/SilentDepth/notion-sticker-creator" target="_blank" class="text-neutral-400 hover:text-white")
      svg(viewBox='0 0 66 64' width='66' height='64' fill='none' class="w-6 h-6")
        path(d='M65.2 32.6C65.2 47 55.9 59.2 42.9 63.5C41.3 63.8 40.7 62.8 40.7 61.9C40.7 60.9 40.7 57.4 40.7 53C40.7 50 39.7 48 38.5 47C45.8 46.2 53.4 43.4 53.4 30.9C53.4 27.3 52.1 24.4 50.1 22.1C50.4 21.3 51.5 18 49.7 13.5C49.7 13.5 47 12.6 40.8 16.9C38.2 16.1 35.4 15.8 32.6 15.8C29.9 15.8 27.1 16.1 24.5 16.9C18.2 12.6 15.5 13.5 15.5 13.5C13.7 18 14.9 21.3 15.2 22.1C13.1 24.4 11.8 27.3 11.8 30.9C11.8 43.4 19.4 46.2 26.7 47C25.7 47.8 24.9 49.2 24.6 51.3C22.7 52.2 18 53.6 15.1 48.6C15.1 48.6 13.4 45.5 10.1 45.3C10.1 45.3 7 45.2 9.9 47.3C9.9 47.3 12 48.3 13.5 52C13.5 52 15.4 58.4 24.5 56.4C24.5 59.1 24.5 61.2 24.5 61.9C24.5 62.8 23.9 63.8 22.3 63.5C9.4 59.2 0 47 0 32.6C0 14.6 14.6 0 32.6 0C50.6 0 65.2 14.6 65.2 32.6V32.6Z' fill='currentColor')
  //Tester
</template>
