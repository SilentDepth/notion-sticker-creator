import path from 'node:path'
import fs from 'node:fs'
import axios from 'axios'

import { isBrowser } from './utils'

const IS_BROWSER = isBrowser()

export const IMAGE_FRAME = (async () => {
  if (IS_BROWSER) {
    const $img = new Image()
    $img.src = '/assets/notion-logo-frame.png'
    await new Promise(resolve => $img.onload = resolve)
    const $canvas = document.createElement('canvas')
    $canvas.width = $img.naturalWidth
    $canvas.height = $img.naturalHeight
    const ctx = $canvas.getContext('2d')!
    ctx.drawImage($img, 0, 0)
    return $canvas.toDataURL()
  } else {
    const encoded = fs.readFileSync(path.resolve(__dirname, '../../public/assets/notion-logo-frame.png')).toString('base64')
    return 'data:image/png;base64,' + encoded
  }
})()

export const FONT_NOTO_SERIF_SC = (async () => {
  if (IS_BROWSER) {
    const { data } = await axios.get('/assets/NotoSerifSC-Bold.otf', { responseType: 'arraybuffer' })
    return data
  } else {
    return fs.readFileSync(path.resolve(__dirname, '../../public/assets/NotoSerifSC-Bold.otf'))
  }
})()
