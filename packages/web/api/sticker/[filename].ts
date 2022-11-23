import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import type { VercelApiHandler } from '@vercel/node'
import { createCanvas, loadImage, registerFont } from 'canvas'
import axios from 'axios'

import '@notion-sticker-creator/canvas-webp'
import { createRenderer } from '@notion-sticker-creator/core'
import profiler from '../../shared/profiler'

const FONT_URL = 'https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Serif/SubsetOTF/SC/NotoSerifSC-Bold.otf'
const FONT_FILENAME = 'NotoSerifSC-Bold.otf'

const notionFrame = loadImage(path.resolve(__dirname, '../../src/assets/notion-logo-frame.png'))

type Format = 'png' | 'jpeg' | 'webp'
type MIME = `image/${Format}`

export default <VercelApiHandler>async function (req, res) {
  const { start, end, result } = profiler()

  // Download the font since it's too big to bundle for Vercel
  start('download-font')
  await new Promise<void>(async resolve => {
    const ws = fs.createWriteStream(path.resolve(os.tmpdir(), FONT_FILENAME))
    ws.on('finish', () => resolve())
    const { data } = await axios.get(FONT_URL, { responseType: 'stream' })
    data.pipe(ws)
  })
  end('download-font')

  // Now we can register the font
  start('register-font')
  registerFont(path.resolve(os.tmpdir(), FONT_FILENAME), {
    family: 'Noto Serif SC',
    weight: '700',
  })
  end('register-font')

  const [text, format] = (req.query.filename as string).split('.') as [string, Format]

  start('render')
  const canvas = createCanvas(512, 512)
  const renderer = createRenderer(canvas, {
    notionFrame,
  })
  await renderer.render(text)
  end('render')

  console.log({ profile: 'sticker', query: text, ...result() })

  const mime: MIME = `image/${format}`
  res
    .setHeader('Content-Type', mime)
    // FIXME: Not sure why
    // @ts-ignore
    .send(canvas.toBuffer(mime))
}
