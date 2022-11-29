<script lang="ts" setup>
import { reactive } from 'vue'

import NotionSticker from './components/notion-sticker.vue'

let text = $ref('风乍暖日初长袅垂杨')
let debug = $ref(false)
const params = reactive({
  padding: 0.25,
})
</script>

<template lang="pug">
div(class="min-h-screen bg-gray-700 text-gray-200 flex flex-col justify-center items-center gap-4")
  NotionSticker(
    :text="text"
    :params="params"
    :debug="debug"
  )
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
      code(class="text-sm") padding
      input(:value="params.padding * 100" type="number" style="width: 100px" @input="params.fontSize = $event.target.value / 100")
</template>

<style scoped>
input {
  padding: 0 4px;
  color: black;
}
</style>
