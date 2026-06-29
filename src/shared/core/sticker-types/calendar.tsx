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

interface DateParts {
  year: number
  month: number
  day: number
  weekday: number
}

export default class CalendarSticker extends Sticker {
  readonly date: Date
  readonly dateParts: DateParts
  readonly color: string
  readonly locale: LOCALES

  constructor(params: Params = {}) {
    super('calendar')

    this.dateParts = resolveDateParts(params.date, params.timezone)
    this.date = new Date(
      Date.UTC(this.dateParts.year, this.dateParts.month - 1, this.dateParts.day),
    )
    this.color =
      params.color === 'week' ? weekdayColor(this.dateParts.weekday) : params.color || 'crimson'
    this.locale = isLocale(params.locale) ? params.locale : LOCALES.zh
  }

  get key(): string {
    this._key ??= JSON.stringify({
      type: this.type,
      date: [
        this.dateParts.year,
        String(this.dateParts.month).padStart(2, '0'),
        String(this.dateParts.day).padStart(2, '0'),
      ].join('-'),
      // TODO: normalize color
      color: this.color,
      locale: this.locale,
    })
    return this._key
  }

  renderNode(debug?: boolean) {
    return Sticker.frame(
      <div
        style={{
          fontFamily: 'Noto Serif SC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 50,
            lineHeight: 1,
            height: '1em',
            translate: '0 -5%',
          }}
        >
          {`${this.dateParts.year} · ${this.dateParts.month}`}
        </span>
        <span
          style={{
            margin: '7px 0',
            fontSize: 150,
            lineHeight: 1,
            height: '1em',
            color: this.color,
            translate: '0 -5%',
            ...(debug ? { boxShadow: '0 0 0 1px #f0f' } : {}),
          }}
        >
          {String(this.dateParts.day)}
        </span>
        <span
          style={{
            fontSize: 50,
            lineHeight: 1,
            height: '1em',
            translate: '0 -5%',
          }}
        >
          {weekday(this.dateParts.weekday, this.locale)}
        </span>
      </div>,
      debug,
    )
  }
}

function isLocale(locale: string | undefined): locale is LOCALES {
  return Boolean(locale && locale in LOCALES)
}

function resolveDateParts(date: string | Date | undefined, timezone = 'Asia/Shanghai'): DateParts {
  if (date) {
    return parseDateParts(date)
  }

  if (IS_BROWSER) {
    return parseDateParts(new Date())
  }

  return getDatePartsInTimeZone(new Date(), timezone)
}

function parseDateParts(date: string | Date): DateParts {
  if (typeof date === 'string') {
    const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/.exec(date)

    if (match?.groups) {
      const year = Number(match.groups.year)
      const month = Number(match.groups.month)
      const day = Number(match.groups.day)
      return { year, month, day, weekday: getUtcWeekday(year, month, day) }
    }
  }

  const value = new Date(date)
  return {
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
    weekday: value.getDay(),
  }
}

function getDatePartsInTimeZone(date: Date, timezone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: timezone,
    year: 'numeric',
  }).formatToParts(date)
  const partMap = Object.fromEntries(parts.map(part => [part.type, part.value]))
  const year = Number(partMap.year)
  const month = Number(partMap.month)
  const day = Number(partMap.day)

  return { year, month, day, weekday: getUtcWeekday(year, month, day) }
}

function getUtcWeekday(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
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
