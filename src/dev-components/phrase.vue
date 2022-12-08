<script lang="ts" setup>
import NotionSticker from '../components/notion-sticker.vue'

let debug = $ref(false)
let text = $ref('这什么玩意儿')
let layout = $ref(null)
let padding = $ref(0.25)
</script>

<template lang="pug">
NotionSticker(:input="text" :layout="layout" :padding="padding" :debug="debug")
div(class="flex items-start gap-2")
  label(class="flex flex-col gap-2")
    code(class="text-sm") &ZeroWidthSpace;
    span(class="flex items-center space-x-1")
      input(v-model="debug" type="checkbox")
      span Debug
  label(class="flex flex-col gap-2")
    code(class="text-sm") text
    input(v-model="text" type="text" style="width: 200px")
  label(class="flex flex-col gap-2")
    code(class="text-sm") layout
    input(v-model="layout" type="text" style="width: 100px")
  label(class="flex flex-col gap-2")
    code(class="text-sm") padding
    input(:value="padding * 100" type="number" style="width: 100px" @input="padding = $event.target.value / 100")
</template>
