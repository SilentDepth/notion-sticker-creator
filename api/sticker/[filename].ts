import type { VercelApiHandler } from '@vercel/node'
import sharp, { type FormatEnum } from 'sharp'

import profiler from '../../shared/profiler'
import createSticker from '../_utils/sticker'

export default <VercelApiHandler>async function (req, res) {
  const { start, end, result } = profiler()

  const [text, format] = (req.query.filename as string).split('.') as [string, keyof FormatEnum]

  start('render')
  const renderResult = createSticker(text, req.query)
  end('render')

  switch (format) {
    case 'svg':
      res.setHeader('Content-Type', 'image/svg+xml')
      res.send(await renderResult)
      break
    default: {
      start('sharp')
      const buffer = await renderResult.toBuffer(format)
      end('sharp')
      res.setHeader('Content-Type', `image/${format}`)
      res.send(buffer)
    }
  }

  console.log({ profile: 'sticker', text, ...result() })
}
