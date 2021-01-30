<template lang="pug">
div(class="mb-16 h-12 flex")
  input(v-model="color" type="color" class="flex-none w-12 h-full")
  input(
    type="text"
    placeholder="最多四个字"
    class="flex-1 w-32 font-sans text-center border-l-0 border-gray-400"
    @vnode-mounted="$event.el.value = text"
    @input="text = $event.target.value.slice(0, 4)"
  )

div(class="relative" :style="{width: size + 'px', height: size + 'px'}")
  div(ref="preview" v-show="!text || !imgSrc" class="w-full h-full bg-frame")
    div(class="absolute font-serif font-black leading-none text-center select-none flex justify-center items-center text-area" :style="textStyle") {{ text }}
  img(v-show="imgSrc" :src="imgSrc" class="absolute inset-0 w-full h-full")
  div(v-show="text && !imgSrc" class="absolute inset-0 w-full h-full bg-gray-100 bg-opacity-50")
    div(class="absolute inset-0 m-auto w-10 h-10 bg-black bg-opacity-75 rounded-md flex justify-center items-center")
      svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="h-6 w-6 text-white animate-spin")
        circle(cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25")
        path(d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor")

//div(class="fixed top-10 left-10 font-serif leading-none font-black" style="background: #0f0; font-size: 100px;")
  span(style="transform: translateY(-6%);") 龍
</template>

<script setup>
import {computed, watch} from 'vue'
import domToImage from 'dom-to-image'

ref: preview
ref: size = 210
ref: text = ''
ref: color = '#000000'
ref: buffers = {}

const textStyle = computed(() => ({
  color,
  fontSize: size * (text.length === 1 ? 0.46 : 0.238) + 'px',
  paddingBottom: text.length === 1 ? '5%' : null,
}))
const imgSrc = computed(() => buffers[text + color])
let timer

watch(textStyle, () => {
  if (timer) {
    timer = clearTimeout(timer)
  }
  timer = setTimeout(render, 1000)
})

async function render () {
  buffers[text + color] = await domToImage.toPng(preview)
}
</script>

<style scoped>
.bg-frame {
  background: url('/src/assets/notion-logo-frame.png') center / 100% no-repeat;
}

.text-area {
  /* background: #0f0a; */
  left: 25%;
  top: 29.4%;
  width: 61.68%;
  height: 58.4%;
  transform-origin: left top;
  transform: skewY(-3.3deg);
}
</style>
