import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { presetUno } from 'unocss'
import unocss from 'unocss/vite'

export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),
    unocss({
      presets: [presetUno()],
    }),
  ],
})
