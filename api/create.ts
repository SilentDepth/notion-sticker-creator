import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import type { VercelApiHandler } from '@vercel/node'
import { createCanvas, loadImage, registerFont } from 'canvas'
import axios from 'axios'

import { createRenderer } from '../src/libs/sticker-renderer'

// Make Vercel static analyser happy
fs.readFile(path.resolve(process.cwd(), 'src/assets/notion-logo-frame.png'), () => {})

const FONT_URL = 'https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Serif/SubsetOTF/SC/NotoSerifSC-Bold.otf'
const FONT_FILENAME = 'NotoSerifSC-Bold.otf'

type Format = 'png' | 'jpeg' | 'webp'

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
    notionFrame: loadImage(path.resolve(process.cwd(), 'src/assets/notion-logo-frame.png')),
  })
  await renderer.render(text)

  switch (format) {
    case 'png':
      res
        .setHeader('Content-Type', 'image/png')
        .send(canvas.toBuffer('image/png'))
      break
    case 'jpeg':
      res
        .setHeader('Content-Type', 'image/jpeg')
        .send(canvas.toBuffer('image/jpeg'))
      break
    case 'webp':
      axios.post(
        // It might be a TLSSocket?
        // @ts-ignore
        `${req.socket.encrypted ? 'https': 'http'}://${req.headers.host}/api/webp`,
        canvas.toBuffer('image/png').toString('base64'),
        {
          responseType: 'arraybuffer',
          headers: { 'Content-Type': 'text/plain' },
        },
      ).then(({ data }) => {
        res
          .setHeader('Content-Type', 'image/webp')
          .send(data)
      })
      break
    default:
      res
        .status(400)
        .end()
  }
}
