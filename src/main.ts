import '@unocss/reset/tailwind.css'
import 'uno.css'
import { createApp } from 'vue'

import { polyfillIntlSegmenter, supportIntlSegmenter } from './libs/feature-detect'
import App from './app.vue'
import Dev from './dev.vue'
import Design from './design.vue'

let root

if (import.meta.env.DEV) {
  switch (true) {
    case location.pathname.startsWith('/dev'):
      root = Dev
      break
    case location.pathname.startsWith('/design'):
      root = Design
      break
    default:
      root = App
  }
} else {
  root = App
}

void async function main () {
  if (!supportIntlSegmenter()) {
    await polyfillIntlSegmenter()
  }
  createApp(root).mount('#app')
}()
