<script lang="ts" setup>
import NotionSticker from '../components/notion-sticker.vue'
import { reactive } from 'vue'

let debug = $ref(false)
let date = $ref<string>()
const params = reactive({
  color: undefined,
  locale: undefined,
})
</script>

<template lang="pug">
NotionSticker(template="calendar" :input="date" :params="params" :debug="debug")
div(class="flex items-start gap-2")
  label(class="flex flex-col gap-2")
    code(class="text-sm") &ZeroWidthSpace;
    span(class="flex items-center space-x-1")
      input(v-model="debug" type="checkbox")
      span Debug
  label(class="flex flex-col gap-2")
    code(class="text-sm") date
    input(v-model="date" type="date")
  label(class="flex flex-col gap-2")
    code(class="text-sm") color
    input(v-model="params.color" type="color")
  label(class="flex flex-col gap-2")
    code(class="text-sm") locale
    input(v-model="params.locale" type="text")
</template>
