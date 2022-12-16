import Sticker from '../sticker'
import { h, IS_BROWSER } from '../utils'

enum LOCALES {
  zh = 'zh',
  en = 'en',
}

interface Params {
  date?: string | Date
  color?: string
  timezone?: string
  locale?: LOCALES
}

export default class CalendarSticker extends Sticker {
  readonly date: Date
  readonly color: string
  readonly locale: LOCALES

  constructor (params: Params = {}) {
    super('calendar')

    if (!IS_BROWSER && !params.date) {
      process.env.TZ = params.timezone || 'Asia/Shanghai'
    }
    this.date = params.date ? new Date(params.date) : new Date()
    this.color = params.color === 'week' ? weekdayColor(this.date.getDay()) : params.color || 'crimson'
    this.locale = params.locale as string in LOCALES ? params.locale! : LOCALES.zh
  }

  get key (): string {
    this._key ??= [
      this.type,
      [this.date.getFullYear(), String(this.date.getMonth() + 1).padStart(2, '0'), String(this.date.getDate()).padStart(2, '0')].join('-'),
      // TODO: normalize color
      this.color,
      this.locale,
    ].join(Sticker.KEY_SEPARATOR)
    return this._key
  }

  renderNode (debug?: boolean) {
    return Sticker.frame([
      h(
        'span',
        { style: `font-size: 50px; height: 1em; transform: translateY(-7.1429%)` },
        `${this.date.getFullYear()} · ${this.date.getMonth() + 1}`,
      ),
      h(
        'span',
        { style: `margin: 7px 0; font-size: 150px; height: 1em; color: ${this.color}; transform: translateY(-7.1429%); ${debug ? 'box-shadow: 0 0 0 1px #f0f' : ''}` },
        String(this.date.getDate()),
      ),
      h(
        'span',
        { style: `font-size: 50px; height: 1em; transform: translateY(-7.1429%)` },
        weekday(this.date.getDay(), this.locale),
      ),
    ], debug)
  }
}

function weekday (day: number, locale: string): string {
  switch (true) {
    case locale.startsWith('en'):
      return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][day]
    case locale.startsWith('zh'):
    default:
      return `星期${'日一二三四五六'[day]}`
  }
}

function weekdayColor (day: number): string {
  return [
    'crimson',
    'tomato',
    'goldenrod',
    'green',
    'dodgerblue',
    'blueviolet',
    'deeppink',
  ][day]
}
