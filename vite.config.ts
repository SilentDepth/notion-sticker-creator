import path from 'node:path'
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
  resolve: {
    alias: {
      sharp: path.resolve(__dirname, 'shared/core/empty-module.ts'),
    },
  },
})
