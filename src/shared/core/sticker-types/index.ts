import {
  Component as CalendarComponent,
  getKey as getCalendarKey,
  normalizeParams as normalizeCalendarParams,
  type Params as CalendarParams,
} from '@/shared/core/sticker-types/calendar.js'
import {
  Component as CssIsAwesomeComponent,
  getKey as getCssIsAwesomeKey,
} from '@/shared/core/sticker-types/css-is-awesome.js'
import {
  Component as NotionCalendarLogoComponent,
  getKey as getNotionCalendarLogoKey,
} from '@/shared/core/sticker-types/notion-calendar.js'
import {
  Component as NotionLogoComponent,
  getKey as getNotionLogoKey,
} from '@/shared/core/sticker-types/notion.js'
import { createPhraseGraphemes } from '@/shared/core/sticker-types/phrase-data.js'
import {
  Component as PhraseComponent,
  getKey as getPhraseKey,
  type ComponentProps as PhraseParams,
} from '@/shared/core/sticker-types/phrase.js'
import {
  Component as QrcodeComponent,
  getKey as getQrcodeKey,
  type Params as QrcodeParams,
} from '@/shared/core/sticker-types/qrcode.js'
import { createStickerRenderer } from '@/shared/core/sticker.js'

export const stickerRegistry = {
  phrase: {
    type: 'phrase',
    normalize: createPhraseGraphemes,
    getKey: getPhraseKey,
    Component: PhraseComponent,
    create: (params: PhraseParams) =>
      createStickerRenderer(
        { type: 'phrase', Component: PhraseComponent, getKey: getPhraseKey },
        params,
      ),
  },
  calendar: {
    type: 'calendar',
    normalize: normalizeCalendarParams,
    getKey: getCalendarKey,
    Component: CalendarComponent,
    create: (params: CalendarParams = {}) =>
      createStickerRenderer(
        { type: 'calendar', Component: CalendarComponent, getKey: getCalendarKey },
        params,
      ),
  },
  qrcode: {
    type: 'qrcode',
    normalize: (params: QrcodeParams) => params,
    getKey: getQrcodeKey,
    Component: QrcodeComponent,
    create: (params: QrcodeParams) =>
      createStickerRenderer(
        { type: 'qrcode', Component: QrcodeComponent, getKey: getQrcodeKey },
        params,
      ),
  },
  'css-is-awesome': {
    type: 'css-is-awesome',
    normalize: () => undefined,
    getKey: getCssIsAwesomeKey,
    Component: CssIsAwesomeComponent,
    create: () =>
      createStickerRenderer(
        { type: 'css-is-awesome', Component: CssIsAwesomeComponent, getKey: getCssIsAwesomeKey },
        {},
      ),
  },
  notion: {
    type: 'notion',
    normalize: () => undefined,
    getKey: getNotionLogoKey,
    Component: NotionLogoComponent,
    create: () =>
      createStickerRenderer(
        { type: 'notion', Component: NotionLogoComponent, getKey: getNotionLogoKey },
        {},
      ),
  },
  'notion-calendar': {
    type: 'notion-calendar',
    normalize: () => undefined,
    getKey: getNotionCalendarLogoKey,
    Component: NotionCalendarLogoComponent,
    create: () =>
      createStickerRenderer(
        {
          type: 'notion-calendar',
          Component: NotionCalendarLogoComponent,
          getKey: getNotionCalendarLogoKey,
        },
        {},
      ),
  },
} as const

type FirstParam<T extends (...args: never[]) => unknown> =
  Parameters<T> extends [] ? undefined : Parameters<T>[0]

export type StickerType = keyof typeof stickerRegistry
export type StickerDefinition<T extends StickerType = StickerType> = (typeof stickerRegistry)[T]
export type StickerInstance<T extends StickerType> = ReturnType<StickerDefinition<T>['create']>
export type StickerParams<T extends StickerType> = FirstParam<StickerDefinition<T>['create']>

export default stickerRegistry
