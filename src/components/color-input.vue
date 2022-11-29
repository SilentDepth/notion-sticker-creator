<script lang="ts" setup>
defineProps({
  modelValue: {
    type: String,
    default: '#000000',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  disabledClass: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<template lang="pug">
div(:class="['flex', disabled && disabledClass]" :style="{ backgroundColor: modelValue }")
  input(:value="modelValue" type="color" :disabled="disabled" class="w-full h-full opacity-0 cursor-pointer disabled:cursor-default" @input="$emit('update:modelValue', $event.target.value)")
</template>
