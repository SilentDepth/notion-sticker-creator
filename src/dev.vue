<script lang="ts" setup>
import { type Component, watch } from 'vue'

const components = import.meta.glob<{ default: Component }>('./dev-components/*.vue')

let current = $ref<string>('./dev-components/phrase.vue')
let currentComp = $shallowRef<Component>()

watch($$(current), async value => {
  currentComp = (await components[value]?.())?.default
}, { immediate: true })
</script>

<template lang="pug">
div(class="min-h-screen bg-gray-700 text-gray-200 flex flex-col")
  nav(class="flex-none flex justify-center")
    a(
      v-for="(_, comp) of components"
      href="javascript:"
      :class="['px-2 py-2', { 'text-white font-bold': current === comp }]"
      @click="current = comp"
    ) {{ comp.replace(/^\.\/dev-components\//, '') }}
  div(class="flex-1 flex flex-col justify-center items-center gap-4")
    component(:is="currentComp")
</template>

<style scoped>
div::v-deep(input) {
  padding: 0 4px;
  color: black;
}
</style>
