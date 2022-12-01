<script lang="ts" setup>
let date = $ref(new Date('2022-12-01'))
const year = $computed(() => date.getFullYear())
const month = $computed(() => date.getMonth() + 1)
const dateOfMonth = $computed(() => date.getDate())
const weekday = $computed(() => '日一二三四五六'[date.getDay()])

let stickerMode = $ref(false)
let transform = $ref(true)
let debug = $ref(false)
</script>

<template lang="pug">
div(class="min-h-screen bg-neutral-700 text-gray-200 flex flex-col justify-center items-center gap-5" :class="{ 'debug-mode': debug }")
  div(
    style="width: 512px; height: 512px; background-image: url(/assets/notion-logo-frame.png); color: black; font-family: Noto Serif SC; font-weight: bold"
    :style="{ transform: stickerMode ? `scale(${208 / 512})` : null }"
  )
    div(
      class="flex flex-col justify-center items-center"
      style="width: 316px; height: 316px; line-height: 1; transform-origin: top left"
      :style="{ transform: transform ? 'translate(128px, 151px) scaleY(0.943) skewY(-3.52deg)' : null, background: transform ? null : 'white' }"
    )
      span.debug(style="font-size: 50px"): span {{ year }} · {{ month }}
      span.debug(style="margin: 7px 0; color: crimson; font-size: 150px"): span {{ dateOfMonth }}
      span.debug(style="font-size: 50px"): span 星期{{ weekday }}
  div(class="flex items-center gap-4")
    label(class="flex items-center gap-2")
      input(v-model="stickerMode" type="checkbox")
      span Sticker size
    label(class="flex items-center gap-2")
      input(v-model="transform" type="checkbox")
      span Transform
    label(class="flex items-center gap-2")
      input(v-model="debug" type="checkbox")
      span Debug
</template>

<style scoped>
.debug-mode .debug {
  background: #0f06;
  box-shadow: 0 0 0 1px #f0f;
}

span span {
  display: flex;
  transform: translateY(-5%);
}
</style>
