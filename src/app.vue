<script setup>
import TheSticker from './components/the-sticker.vue'
import Tester from './tester.vue'

let sticker = $ref(null)
let text = $ref('你好世界')

/**
 * @param {string} format
 */
function download (format) {
  const a = document.createElement('a')
  a.href = sticker.canvas.toDataURL(`image/${format}`)
  a.download = `notion-sticker.${format}`
  a.click()
  a.remove()
}
</script>

<template lang="pug">
div(class="min-h-screen pt-10 bg-black flex flex-col items-center space-y-5")
  div(class="text-xl text-white")
    img(src="/icon.png" class="mx-auto" style="width: 64px; height: 64px;")
    h1(class="mt-2 font-bold text-center" style="font-family: 'Noto Serif SC';") Notion 贴纸生成器
  p(class="text-neutral-400") 1. 输入内容文本（最多 4 个字符）
  input(v-model="text" type="text" class="box-content w-[4em] px-[1em] py-[0.25em] text-lg bg-neutral-800 text-white border border-neutral-600 rounded outline-none text-center focus:border-neutral-500")
  p(class="text-neutral-400") 2. 预览生成效果（有 Bug 属正常）
  div(class="relative")
    //img(src="./assets/sticker-3.webp" class="absolute inset-0")
    TheSticker(ref="sticker" :text="text" class="w-[256px] h-[256px]")
  p(class="text-neutral-400") 3. 点击下载按钮（iOS 不支持生成为 WebP）
  div(class="flex flex-col space-y-5")
    button(type="button" class="px-[1em] py-[0.25em] text-lg bg-blue-600 text-white rounded" @click="download('webp')") 下载 WebP 文件
    button(type="button" class="px-[1em] py-[0.25em] text-lg bg-blue-600 text-white rounded" @click="download('png')") 下载 PNG 文件
  //Tester
</template>
