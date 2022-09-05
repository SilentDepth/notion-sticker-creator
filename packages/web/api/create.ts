import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import type { VercelApiHandler } from '@vercel/node'
import { createCanvas, loadImage, registerFont } from 'canvas'
import axios from 'axios'
import '@notion-sticker-creator/canvas-webp'

import { createRenderer } from '@notion-sticker-creator/core'

const FONT_URL = 'https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Serif/SubsetOTF/SC/NotoSerifSC-Bold.otf'
const FONT_FILENAME = 'NotoSerifSC-Bold.otf'

type Format = 'png' | 'jpeg' | 'webp'
type MIME = `image/${Format}`

export default <VercelApiHandler>async function (req, res) {
  // Download the font since it's too big to bundle for Vercel
  await new Promise<void>(async resolve => {
    const ws = fs.createWriteStream(path.resolve(os.tmpdir(), FONT_FILENAME))
    ws.on('finish', () => resolve())
    const { data } = await axios.get(FONT_URL, { responseType: 'stream' })
    data.pipe(ws)
  })

  // Now we can register the font
  registerFont(path.resolve(os.tmpdir(), FONT_FILENAME), {
    family: 'Noto Serif SC',
    weight: '700',
  })

  const { text, format } = req.query as {
    text: string
    format: Format
  }

  const canvas = createCanvas(512, 512)
  const renderer = createRenderer(canvas, {
    notionFrame: loadImage(path.resolve(__dirname, '../src/assets/notion-logo-frame.png')),
  })
  await renderer.render(text)

  const mime: MIME = `image/${format}`
  res
    .setHeader('Content-Type', mime)
    // FIXME: Not sure why
    // @ts-ignore
    .send(canvas.toBuffer(mime))
}
