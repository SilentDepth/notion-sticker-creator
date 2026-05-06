import CalendarSticker from '@/shared/core/sticker-types/calendar.js'
import CssIsAwesomeSticker from '@/shared/core/sticker-types/css-is-awesome.js'
import NotionCalendarLogoSticker from '@/shared/core/sticker-types/notion-calendar.js'
import NotionLogoSticker from '@/shared/core/sticker-types/notion.js'
import PhraseSticker from '@/shared/core/sticker-types/phrase.js'
import QrcodeSticker from '@/shared/core/sticker-types/qrcode.js'

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
