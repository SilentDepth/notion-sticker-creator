import PhraseSticker from './phrase.js'
import CalendarSticker from './calendar.js'
import CssIsAwesomeSticker from './css-is-awesome.js'
import NotionLogoSticker from './notion.js'
import NotionCalendarLogoSticker from './notion-calendar.js'
import QrcodeSticker from './qrcode.js'

export {
  PhraseSticker,
  CalendarSticker,
  QrcodeSticker,
  CssIsAwesomeSticker,
  NotionLogoSticker,
  NotionCalendarLogoSticker,
}

export type StickerClassMap = {
  phrase: PhraseSticker
  calendar: CalendarSticker
  qrcode: QrcodeSticker
  'css-is-awesome': CssIsAwesomeSticker
  notion: NotionLogoSticker
  'notion-calendar': NotionCalendarLogoSticker
}
export type StickerClassCtorMap = {
  phrase: typeof PhraseSticker
  calendar: typeof CalendarSticker
  qrcode: typeof QrcodeSticker
  'css-is-awesome': typeof CssIsAwesomeSticker
  notion: typeof NotionLogoSticker
  'notion-calendar': typeof NotionCalendarLogoSticker
}
export type StickerType = keyof StickerClassMap
export type StickerClass<T extends StickerType> = StickerClassMap[T]
export type StickerParams<T extends StickerType> = ConstructorParameters<StickerClassCtorMap[T]>[0]

