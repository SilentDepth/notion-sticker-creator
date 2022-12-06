import '@unocss/reset/tailwind.css'
import 'uno.css'
import { createApp } from 'vue'

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

createApp(root).mount('#app')
