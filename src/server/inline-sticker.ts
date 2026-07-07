import type { ParsedQuery, QueryArgs } from './query'
import createSticker from '@/shared/core'
import type { StickerParams, StickerType } from '@/shared/core/sticker-types'

export type StickerRequest = {
  [T in StickerType]: {
    params?: StickerParams<T>
    type: T
  }
}[StickerType]

export function resolveInlineSticker(parsedQuery: ParsedQuery): StickerRequest | undefined {
  const [type, args] = parsedQuery

  switch (type) {
    case undefined:
    case 'phrase': {
      const { 0: text, ...params } = args
      if (!text) return
      const fullText = getPositionalArgs(args).join(' ')

      switch (true) {
        case text === 'css' && fullText === 'css is awesome':
          return { type: 'css-is-awesome' }
        case text === 'notion' && fullText === 'notion logo':
          return { type: 'notion' }
        case text === 'notion' && fullText === 'notion calendar logo':
          return { type: 'notion-calendar' }
        default:
          return {
            type: 'phrase',
            params: {
              ...params,
              max: Infinity,
              text,
            },
          }
      }
    }
    case 'calendar':
    case 'cal': {
      const { 0: date, ...params } = args
      return { type: 'calendar', params: { ...params, date } }
    }
    case 'qrcode':
    case 'qr': {
      const { 0: data } = args
      if (!data) return
      return { type: 'qrcode', params: { data } }
    }
  }
}

export function createStickerFromRequest(
  stickerRequest: StickerRequest,
): ReturnType<typeof createSticker> {
  switch (stickerRequest.type) {
    case 'phrase':
      return createSticker('phrase', stickerRequest.params)
    case 'calendar':
      return createSticker('calendar', stickerRequest.params)
    case 'qrcode':
      return createSticker('qrcode', stickerRequest.params)
    case 'css-is-awesome':
      return createSticker('css-is-awesome')
    case 'notion':
      return createSticker('notion')
    case 'notion-calendar':
      return createSticker('notion-calendar')
  }
}

function getPositionalArgs(args: QueryArgs): string[] {
  const values: string[] = []

  for (let idx = 0; String(idx) in args; idx++) {
    values.push(args[String(idx)])
  }

  return values
}
