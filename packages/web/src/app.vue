<script lang="ts" setup>
import TheSticker from './components/the-sticker.vue'
import Tester from './tester.vue'

let sticker = $ref(null as typeof TheSticker | null)
let text = $ref('你好世界')

function download (format: string) {
  const a = document.createElement('a')
  a.href = sticker!.canvas.toDataURL(`image/${format}`)
  a.download = `notion-sticker.${format}`
  a.click()
  a.remove()
}
</script>

<template lang="pug">
div(class="min-h-screen py-10 bg-black flex flex-col items-center space-y-5")
  div(class="text-xl text-white")
    img(src="/icon.png" class="mx-auto" style="width: 64px; height: 64px;")
    h1(class="mt-2 font-bold text-center" style="font-family: 'Noto Serif SC';") Notion 贴纸生成器

  p(class="text-neutral-400") 1. 输入内容文本（最多 4 个字符）
  input(v-model="text" type="text" class="box-content w-[4em] px-[1em] py-[0.25em] text-lg bg-neutral-800 text-white border border-neutral-600 rounded outline-none text-center focus:border-neutral-500")

  p(class="text-neutral-400") 2. 预览生成效果（有 Bug 属正常）
  TheSticker(ref="sticker" :text="text")

  p(class="text-neutral-400") 3. 点击下载按钮（iOS 不支持生成为 WebP）
  div(class="flex flex-col space-y-5")
    button(type="button" class="px-[1em] py-[0.25em] text-lg bg-blue-600 text-white rounded hover:bg-blue-500" @click="download('webp')") 下载 WebP 文件
    button(type="button" class="px-[1em] py-[0.25em] text-lg bg-blue-600 text-white rounded hover:bg-blue-500" @click="download('png')") 下载 PNG 文件

  div(class="mt-10!")
    a(href="https://github.com/SilentDepth/notion-sticker-creator" target="_blank" class="text-neutral-400 hover:text-white")
      svg(viewBox='0 0 66 64' width='66' height='64' fill='none' class="w-6 h-6")
        path(d='M65.2 32.6C65.2 47 55.9 59.2 42.9 63.5C41.3 63.8 40.7 62.8 40.7 61.9C40.7 60.9 40.7 57.4 40.7 53C40.7 50 39.7 48 38.5 47C45.8 46.2 53.4 43.4 53.4 30.9C53.4 27.3 52.1 24.4 50.1 22.1C50.4 21.3 51.5 18 49.7 13.5C49.7 13.5 47 12.6 40.8 16.9C38.2 16.1 35.4 15.8 32.6 15.8C29.9 15.8 27.1 16.1 24.5 16.9C18.2 12.6 15.5 13.5 15.5 13.5C13.7 18 14.9 21.3 15.2 22.1C13.1 24.4 11.8 27.3 11.8 30.9C11.8 43.4 19.4 46.2 26.7 47C25.7 47.8 24.9 49.2 24.6 51.3C22.7 52.2 18 53.6 15.1 48.6C15.1 48.6 13.4 45.5 10.1 45.3C10.1 45.3 7 45.2 9.9 47.3C9.9 47.3 12 48.3 13.5 52C13.5 52 15.4 58.4 24.5 56.4C24.5 59.1 24.5 61.2 24.5 61.9C24.5 62.8 23.9 63.8 22.3 63.5C9.4 59.2 0 47 0 32.6C0 14.6 14.6 0 32.6 0C50.6 0 65.2 14.6 65.2 32.6V32.6Z' fill='currentColor')
  //Tester
</template>
