import Sticker from './sticker'
import { CssIsAwesomeSticker, StickerClass, StickerParams, StickerType } from './sticker-types'
import { PhraseSticker, CalendarSticker, NotionLogoSticker } from './sticker-types'

export * from './sticker-types'

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
    default:
      throw new Error('Unsupported sticker type')
  }
}
