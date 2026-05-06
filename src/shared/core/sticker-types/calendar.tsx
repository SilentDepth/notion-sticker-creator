import Sticker from '@/shared/core/sticker.js'
import { IS_BROWSER } from '@/shared/core/utils.js'

enum LOCALES {
  zh = 'zh',
  en = 'en',
}

interface Params {
  date?: string | Date
  color?: string
  timezone?: string
  locale?: string
}

export default class CalendarSticker extends Sticker {
  readonly date: Date
  readonly color: string
  readonly locale: LOCALES

  constructor(params: Params = {}) {
    super('calendar')

    if (!IS_BROWSER && typeof process !== 'undefined' && !params.date) {
      process.env.TZ = params.timezone || 'Asia/Shanghai'
    }
    this.date = params.date ? new Date(params.date) : new Date()
    this.color =
      params.color === 'week' ? weekdayColor(this.date.getDay()) : params.color || 'crimson'
    this.locale = isLocale(params.locale) ? params.locale : LOCALES.zh
  }

  get key(): string {
    this._key ??= JSON.stringify({
      type: this.type,
      date: [
        this.date.getFullYear(),
        String(this.date.getMonth() + 1).padStart(2, '0'),
        String(this.date.getDate()).padStart(2, '0'),
      ].join('-'),
      // TODO: normalize color
      color: this.color,
      locale: this.locale,
    })
    return this._key
  }

  renderNode(debug?: boolean) {
    return Sticker.frame(
      <>
        <span style={{ fontSize: '50px', height: '1em', transform: 'translateY(-7.1429%)' }}>
          {`${this.date.getFullYear()} · ${this.date.getMonth() + 1}`}
        </span>
        <span
          style={{
            margin: '7px 0',
            fontSize: '150px',
            height: '1em',
            color: this.color,
            transform: 'translateY(-7.1429%)',
            ...(debug ? { boxShadow: '0 0 0 1px #f0f' } : {}),
          }}
        >
          {String(this.date.getDate())}
        </span>
        <span style={{ fontSize: '50px', height: '1em', transform: 'translateY(-7.1429%)' }}>
          {weekday(this.date.getDay(), this.locale)}
        </span>
      </>,
      debug,
    )
  }
}

function isLocale(locale: string | undefined): locale is LOCALES {
  return Boolean(locale && locale in LOCALES)
}

function weekday(day: number, locale: string): string {
  switch (true) {
    case locale.startsWith('en'):
      return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][day]
    case locale.startsWith('zh'):
    default:
      return `星期${'日一二三四五六'[day]}`
  }
}

function weekdayColor(day: number): string {
  return ['crimson', 'tomato', 'goldenrod', 'green', 'dodgerblue', 'blueviolet', 'deeppink'][day]
}
