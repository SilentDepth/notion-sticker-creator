import type { VercelApiHandler } from '@vercel/node'
import type { FormatEnum } from 'sharp'

import createSticker from '../../shared/core/index.js'

interface RequestQuery {
  filename: string
  color?: string
}

export default <VercelApiHandler>async function (req, res) {
  const { filename, color } = req.query as unknown as RequestQuery
  const [text, format = 'webp'] = filename.split('.') as [string, keyof FormatEnum]

  if (!text) return end()

  const sticker = createSticker('phrase', { text, color })
  switch (format) {
    case 'svg':
      res.setHeader('Content-Type', 'image/svg+xml')
      res.send(await sticker.render())
      break
    default:
      res.setHeader('Content-Type', `image/${format}`)
      res.send(await sticker.render().toBuffer(format))
  }

  return end()

  function end () {
    res.status(204)
    res.end()
  }
}
