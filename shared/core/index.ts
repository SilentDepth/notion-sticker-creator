import Sticker from './sticker'
import { CssIsAwesomeSticker, PhraseSticker, CalendarSticker, NotionLogoSticker, NotionCalendarLogoSticker } from './sticker-types/index.js'
import type { StickerClass, StickerParams, StickerType } from './sticker-types/index.js'

export * from './sticker-types/index.js'

export default function createSticker<T extends StickerType> (type: T, params?: StickerParams<T>): StickerClass<T>
export default function createSticker (type: StickerType, params?: any): Sticker {
  switch (type) {
    case 'phrase':
      return new PhraseSticker(params)
    case 'calendar':
      return new CalendarSticker(params)
    case 'css-is-awesome':
      return new CssIsAwesomeSticker()
    case 'notion':
      return new NotionLogoSticker()
    case 'notion-calendar':
      return new NotionCalendarLogoSticker()
    default:
      throw new Error('Unsupported sticker type')
  }
}
