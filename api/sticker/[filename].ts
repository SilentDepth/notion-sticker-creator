import type { VercelApiHandler } from '@vercel/node'
import sharp, { type FormatEnum } from 'sharp'

import profiler from '../../shared/profiler'
import render from '../../shared/renderer'

export default <VercelApiHandler>async function (req, res) {
  const { start, end, result } = profiler()

  const [text, format] = (req.query.filename as string).split('.') as [string, keyof FormatEnum]

  start('render')
  const svg = await render(text, { color: req.query.color })
  end('render')

  switch (format) {
    case 'svg':
      res.setHeader('Content-Type', 'image/svg+xml')
      res.send(svg)
      break
    default: {
      start('sharp')
      const svgBuffer = Buffer.from(svg, 'ascii')
      const resData = await sharp(svgBuffer).toFormat(format).toBuffer()
      end('sharp')
      res.setHeader('Content-Type', `image/${format}`)
      res.send(resData)
    }
  }

  console.log({ profile: 'sticker', text, ...result() })
}
