import { reactive, toRefs } from 'vue'

const flags = reactive({
  example: false,
})

export default function useFlag () {
  return toRefs(flags)
}
