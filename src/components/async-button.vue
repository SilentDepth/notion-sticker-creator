<script lang="ts" setup>
const props = defineProps({
  onClick: {
    type: Function,
    default: null,
  },
})

let done = $ref(false)

async function handleClick () {
  const ret = props.onClick?.()
  if (ret instanceof Promise) {
    await ret
    done = true
    setTimeout(() => done = false, 2000)
  }
}
</script>

<template lang="pug">
button(class="relative" @click="handleClick")
  slot(:done="done")
  transition(
    v-if="$slots.async"
    enter-from-class="opacity-0 scale-0"
    leave-to-class="opacity-0"
    enter-active-class="transition duration-200 ease-in-out"
    leave-active-class="transition duration-200 ease-in-out"
  )
    div(v-show="done" class="absolute inset-0")
      slot(name="async")
</template>
