<script lang="ts" setup>
defineProps({
  modelValue: {
    type: String,
    default: '#000000',
  },
})

defineEmits(['update:modelValue'])
</script>

<template lang="pug">
div(class="flex" :style="{ backgroundColor: modelValue }")
  input(:value="modelValue" type="color" class="w-full h-full opacity-0" @input="$emit('update:modelValue', $event.target.value)")
</template>
