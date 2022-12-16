<script lang="ts" setup>
import { reactive } from 'vue'

import NotionSticker from '../components/notion-sticker.vue'

let sticker = $shallowRef<any>()
let debug = $ref(false)
const params = reactive({
  text: '##goldenrod=天地\n玄黄\n  #crimson=🌧️宙\n  洪荒$',
  max: Infinity,
})
</script>

<template lang="pug">
NotionSticker(:params="params" :debug="debug" @update:instance="sticker = $event")
pre(class="text-xs") &ZeroWidthSpace;{{ sticker?.key }}
div(class="flex items-start gap-2")
  label(class="flex flex-col gap-2")
    code(class="text-sm") &ZeroWidthSpace;
    span(class="flex items-center space-x-1")
      input(v-model="debug" type="checkbox")
      span Debug
  label(class="flex flex-col gap-2")
    code(class="text-sm") text
    input(v-model="params.text" type="text" style="width: 200px")
</template>
