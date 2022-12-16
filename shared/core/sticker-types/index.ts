import PhraseSticker from './phrase'
import CalendarSticker from './calendar'
import CssIsAwesomeSticker from './css-is-awesome'

export {
  PhraseSticker,
  CalendarSticker,
  CssIsAwesomeSticker,
}

export type StickerClassMap = {
  phrase: PhraseSticker
  calendar: CalendarSticker
  'css-is-awesome': CssIsAwesomeSticker
}
export type StickerClassTypeMap = {
  phrase: typeof PhraseSticker
  calendar: typeof CalendarSticker
  'css-is-awesome': typeof CssIsAwesomeSticker
}
export type StickerType = keyof StickerClassMap
export type StickerClass<T extends StickerType> = StickerClassMap[T]
export type StickerParams<T extends StickerType> = ConstructorParameters<StickerClassTypeMap[T]>[0]

