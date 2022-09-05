import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { presetUno } from 'unocss'
import unocss from 'unocss/vite'

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
  },

  plugins: [
    vue({ reactivityTransform: true }),
    unocss({
      presets: [presetUno()],
    }),
  ],
})
