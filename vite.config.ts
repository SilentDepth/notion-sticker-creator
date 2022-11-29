import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { presetUno } from 'unocss'
import unocss from 'unocss/vite'

import stickerHandler from './api/sticker/[filename]'

export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),
    unocss({
      presets: [presetUno()],
    }),
    // api(),
  ],
})

function api () {
  return {
    name: 'api',
    configureServer (server) {
      server.middlewares.use('/api/sticker', (req, res, next) => {
        const url = new URL(req.url!, `https://${req.headers.host}`)
        const filename = decodeURIComponent(url.pathname.slice(1))
        // @ts-ignore
        req.query = { filename, ...Object.fromEntries(url.searchParams.entries()) }
        // @ts-ignore
        res.send = res.end
        // @ts-ignore
        return stickerHandler(req, res)
      })
    },
  } as Plugin
}
