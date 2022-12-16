<script lang="ts" setup>
import NotionSticker from '../components/notion-sticker.vue'
import { reactive } from 'vue'

let sticker = $shallowRef<any>()
let debug = $ref(false)
const params = reactive({
  date: undefined,
  color: undefined,
  locale: undefined,
})
</script>

<template lang="pug">
NotionSticker(template="calendar" :params="params" :debug="debug" @update:instance="sticker = $event")
pre &ZeroWidthSpace;{{ sticker?.key }}
div(class="flex items-start gap-2")
  label(class="flex flex-col gap-2")
    code(class="text-sm") &ZeroWidthSpace;
    span(class="flex items-center space-x-1")
      input(v-model="debug" type="checkbox")
      span Debug
  label(class="flex flex-col gap-2")
    code(class="text-sm") date
    input(v-model="params.date" type="date")
  label(class="flex flex-col gap-2")
    code(class="text-sm") color
    input(v-model="params.color" type="color")
  label(class="flex flex-col gap-2")
    code(class="text-sm") locale
    input(v-model="params.locale" type="text")
</template>
