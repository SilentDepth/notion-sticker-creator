import type { VercelApiHandler } from '@vercel/node'
import type { FormatEnum } from 'sharp'
import createSticker from '../../../shared/core/index.js'

export default <VercelApiHandler>async function (req, res) {
  const { format, ...params } = resolveQuery(req.query)

  if ('data' in params && params.data) {
    const sticker = createSticker('qrcode', params as { data: string })
    res.setHeader('Content-Type', resolveMIME(format))
    res.send(format === 'svg' ? await sticker : await sticker.render().toBuffer(format))
  } else {
    res.statusCode = 204
    res.send(null)
  }
}

interface RequestQuery {
  format: keyof FormatEnum
}

function resolveQuery (query: Partial<RequestQuery> = {}): RequestQuery {
  return {
    ...query,
    format: query.format || 'webp',
  }
}

function resolveMIME (format: RequestQuery['format']): string {
  switch (format) {
    case 'svg':
      return 'image/svg+xml'
    case 'jpg':
      return 'image/jpeg'
    default:
      return `image/${format}`
  }
}
