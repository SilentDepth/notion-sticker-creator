<script setup>
import StickerRenderer from './components/sticker-renderer.vue'
import Tester from './tester.vue'

let text = $ref('你好世界')
let dataURI = $ref(null)

function download () {
  const a = document.createElement('a')
  a.href = dataURI
  a.download = 'notion-sticker.webp'
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
    StickerRenderer(:text="text" class="w-[256px] h-[256px]" @update="value => dataURI = value")
  p(class="text-neutral-400") 3. 点击下载按钮（之后如何使用请自行探索）
  button(type="button" class="px-[1em] py-[0.25em] text-lg bg-blue-600 text-white rounded" @click="download") 下载
  //Tester
</template>
