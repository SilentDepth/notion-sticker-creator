import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import windicss from 'vite-plugin-windicss'

export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true,}),
    windicss({
      scan: {
        dirs: ['.'],
      },
    }),
  ],
})
