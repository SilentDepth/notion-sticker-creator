import path from 'node:path'
import fs from 'node:fs'
import url from 'node:url'
import axios from 'axios'

import { isBrowser } from './utils.js'

const IS_BROWSER = isBrowser()
const __dirname = IS_BROWSER ? '' : path.resolve(url.fileURLToPath(import.meta.url), '..')

export const IMAGE_FRAME = (async () => {
  if (IS_BROWSER) {
    const $img = await fetchImage('/assets/notion-logo-frame.png')
    return imgToDataURL($img)
  } else {
    const encoded = fs.readFileSync(path.resolve(__dirname, '../../public/assets/notion-logo-frame.png')).toString('base64')
    return 'data:image/png;base64,' + encoded
  }
})()

export const IMAGE_NOTION = (async () => {
  if (IS_BROWSER) {
    const $img = await fetchImage('/assets/notion-logo.png')
    return imgToDataURL($img)
  } else {
    const encoded = fs.readFileSync(path.resolve(__dirname, '../../public/assets/notion-logo.png')).toString('base64')
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

async function fetchImage (src: string): Promise<HTMLImageElement> {
  const $img = new Image()
  $img.src = src
  return new Promise(resolve => $img.onload = () => resolve($img))
}

function imgToDataURL ($img: HTMLImageElement): string {
  const $canvas = document.createElement('canvas')
  $canvas.width = $img.naturalWidth
  $canvas.height = $img.naturalHeight
  const ctx = $canvas.getContext('2d')!
  ctx.drawImage($img, 0, 0)
  return $canvas.toDataURL()
}
