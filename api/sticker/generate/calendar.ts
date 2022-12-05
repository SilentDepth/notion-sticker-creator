import type { VercelApiHandler } from '@vercel/node'
import type { FormatEnum } from 'sharp'

import weekdayColors from '../../../shared/renderer/weekday-colors'
import createSticker from '../../_utils/sticker'

export default <VercelApiHandler>async function (req, res) {
  const { date, format, ...params } = resolveQuery(req.query)

  const sticker = createSticker(date, { template: 'calendar', ...params })

  res.setHeader('Content-Type', resolveMIME(format))
  res.send(format === 'svg' ? await sticker : await sticker.toBuffer(format))
}

interface RequestQuery {
  date: string | Date
  timezone: string
  locale: string
  format: keyof FormatEnum
  color: string
}

function resolveQuery (query: Partial<RequestQuery> = {}): RequestQuery {
  process.env.TZ = query.timezone || 'Asia/Shanghai'

  const date = query.date && typeof query.date === 'string' ? new Date(query.date) : new Date()

  const color = query.color === 'week' ? weekdayColors[date.getDay()] : query.color

  return {
    date,
    timezone: query.timezone || process.env.TZ,
    locale: query.locale || 'zh',
    format: query.format || 'webp',
    color: color || 'crimson',
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
