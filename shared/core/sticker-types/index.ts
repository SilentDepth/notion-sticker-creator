import PhraseSticker from './phrase'
import CalendarSticker from './calendar'
import CssIsAwesomeSticker from './css-is-awesome'
import NotionLogoSticker from './notion'

export {
  PhraseSticker,
  CalendarSticker,
  CssIsAwesomeSticker,
  NotionLogoSticker,
}

export type StickerClassMap = {
  phrase: PhraseSticker
  calendar: CalendarSticker
  'css-is-awesome': CssIsAwesomeSticker
  notion: NotionLogoSticker
}
export type StickerClassCtorMap = {
  phrase: typeof PhraseSticker
  calendar: typeof CalendarSticker
  'css-is-awesome': typeof CssIsAwesomeSticker
  notion: typeof NotionLogoSticker
}
export type StickerType = keyof StickerClassMap
export type StickerClass<T extends StickerType> = StickerClassMap[T]
export type StickerParams<T extends StickerType> = ConstructorParameters<StickerClassCtorMap[T]>[0]

