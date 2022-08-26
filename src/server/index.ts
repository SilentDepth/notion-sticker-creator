import { resolve } from 'node:path'
import { createCanvas, loadImage, registerFont } from 'canvas'
import sharp from 'sharp'

import { createRenderer } from '../libs/sticker-renderer'

registerFont(resolve(__dirname, '../assets/NotoSerifSC-Bold.otf'), {
  family: 'Noto Serif SC',
  weight: '700',
})


void async function () {
  const canvas = createCanvas(512, 512)
  const renderer = createRenderer(canvas, {
    notionFrame: loadImage(resolve(__dirname, '../assets/notion-logo-frame.png')),
  })
  await renderer.render('坐和放宽')
  const buffer = canvas.toBuffer('image/png')
  await sharp(buffer).toFile('/Users/sd/Downloads/notion-sticker.webp')
  console.log('Done')
}()
