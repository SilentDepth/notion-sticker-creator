import { hash } from 'ohash'
import { Component as Frame } from './notion-logo-frame'
import { IS_BROWSER } from '@/shared/core/utils.js'

enum LOCALES {
  zh = 'zh',
  en = 'en',
}

export interface Params {
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

export interface NormalizedParams extends DateParts {
  date: string
  color: string
  locale: LOCALES
}

export function normalizeParams(params: Params = {}): NormalizedParams {
  const dateParts = resolveDateParts(params.date, params.timezone)

  return {
    ...dateParts,
    date: formatDate(dateParts),
    color: params.color === 'week' ? weekdayColor(dateParts.weekday) : params.color || 'crimson',
    locale: isLocale(params.locale) ? params.locale : LOCALES.zh,
  }
}

export const getKey = (params?: Params) => {
  const normalizedParams = normalizeParams(params)

  return createCalendarKey({
    type: 'calendar',
    date: normalizedParams.date,
    color: normalizedParams.color,
    locale: normalizedParams.locale,
  })
}

export interface ComponentProps extends Params {
  debug?: boolean
}

export function Component({ debug, ...params }: ComponentProps) {
  const { year, month, day, weekday, color, locale } = normalizeParams(params)

  const pStyle = Object.assign(
    { margin: 0, fontFamily: 'Noto Serif SC' },
    debug ? { outline: '1px solid #f0f', outlineOffset: -1 } : undefined,
  )
  const spanStyle = { display: 'block', transform: 'translateY(-5%)' }

  return (
    <Frame debug={debug}>
      <div
        style={{
          height: '100%',
          padding: '26px 0',
          fontFamily: 'Noto Serif SC',
          lineHeight: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <p style={{ ...pStyle, fontSize: 50 }}>
          <span style={spanStyle}>
            {year} &middot; {month}
          </span>
        </p>
        <p style={{ ...pStyle, fontSize: 150, color }}>
          <span style={spanStyle}>{day}</span>
        </p>
        <p style={{ ...pStyle, fontSize: 50 }}>
          <span style={spanStyle}>{weekdayName(weekday, locale)}</span>
        </p>
      </div>
    </Frame>
  )
}

function isLocale(locale: string | undefined): locale is LOCALES {
  return Boolean(locale && locale in LOCALES)
}

function createCalendarKey(params: {
  type: 'calendar'
  date: string
  color: string
  locale: LOCALES
}): string {
  return hash(params)
}

function formatDate(dateParts: DateParts): string {
  return [
    dateParts.year,
    String(dateParts.month).padStart(2, '0'),
    String(dateParts.day).padStart(2, '0'),
  ].join('-')
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

function weekdayName(day: number, locale: string): string {
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
