import { hash } from 'ohash'
import { expect, test, vi } from 'vite-plus/test'
import { resolveInlineSticker } from '@/server/inline-sticker'
import { parseQuery } from '@/server/query'
import { getKey as getCalendarKey } from '@/shared/core/sticker-types/calendar'
import { createPhraseGraphemes, createPhraseKey } from '@/shared/core/sticker-types/phrase-data'

function phraseKey(params: Parameters<typeof createPhraseGraphemes>[0]): string {
  return createPhraseKey('phrase', createPhraseGraphemes(params))
}

test('parseQuery', () => {
  expect(parseQuery('天地玄黄')).toEqual([undefined, { 0: '天地玄黄' }])
  expect(parseQuery('天地玄黄 foo=lorem bar=ipsum')).toEqual([
    undefined,
    {
      0: '天地玄黄',
      foo: 'lorem',
      bar: 'ipsum',
    },
  ])
  expect(parseQuery('$phrase 天地玄黄')).toEqual(['phrase', { 0: '天地玄黄' }])
  expect(parseQuery('$phrase 天地玄黄 foo=lorem bar=ipsum')).toEqual([
    'phrase',
    {
      0: '天地玄黄',
      foo: 'lorem',
      bar: 'ipsum',
    },
  ])
  expect(parseQuery('天地玄黄 宇宙洪荒')).toEqual([undefined, { 0: '天地玄黄', 1: '宇宙洪荒' }])
  expect(parseQuery('天地玄黄 foo=lorem 宇宙洪荒')).toEqual([
    undefined,
    {
      0: '天地玄黄',
      1: '宇宙洪荒',
      foo: 'lorem',
    },
  ])
  expect(parseQuery('天地玄黄\\ 宇宙洪荒')).toEqual([undefined, { 0: '天地玄黄\\ 宇宙洪荒' }])
  expect(parseQuery('天地玄黄 foo=宇宙\\ 洪荒')).toEqual([
    undefined,
    { 0: '天地玄黄', foo: '宇宙\\ 洪荒' },
  ])
  expect(parseQuery('$')).toEqual([undefined, { 0: '$' }])
  expect(parseQuery('\\$phrase')).toEqual([undefined, { 0: '\\$phrase' }])
})

test('resolveInlineSticker', () => {
  expect(resolveInlineSticker(parseQuery('天地玄黄')!)).toEqual({
    type: 'phrase',
    params: { text: '天地玄黄', max: Infinity },
  })
  expect(resolveInlineSticker(parseQuery('$phrase')!)).toBeUndefined()
  expect(resolveInlineSticker(parseQuery('css is awesome')!)).toEqual({ type: 'css-is-awesome' })
  expect(resolveInlineSticker(parseQuery('notion logo')!)).toEqual({ type: 'notion' })
  expect(resolveInlineSticker(parseQuery('notion calendar logo')!)).toEqual({
    type: 'notion-calendar',
  })
  expect(resolveInlineSticker(parseQuery('$cal 2024-01-02 color=week')!)).toEqual({
    type: 'calendar',
    params: { date: '2024-01-02', color: 'week' },
  })
  expect(resolveInlineSticker(parseQuery('$qr https://example.com')!)).toEqual({
    type: 'qrcode',
    params: { data: 'https://example.com' },
  })
  expect(resolveInlineSticker(parseQuery('$qr')!)).toBeUndefined()
  expect(resolveInlineSticker(parseQuery('$unknown text')!)).toBeUndefined()
})

test('phrase sticker key', () => {
  let text!: string
  function use(newText: string) {
    text = newText
  }

  use('永')
  expect(phraseKey({ text })).toBe(
    hash({ type: 'phrase', graphemes: [{ value: '永', color: '#000000' }] }),
  )
  expect(phraseKey({ text, color: '#66ccff' })).toBe(
    hash({ type: 'phrase', graphemes: [{ value: '永', color: '#66ccff' }] }),
  )
  expect(phraseKey({ text, color: '#6cf' })).toBe(
    hash({ type: 'phrase', graphemes: [{ value: '永', color: '#66ccff' }] }),
  )
  expect(phraseKey({ text, color: 'goldenrod' })).toBe(
    hash({ type: 'phrase', graphemes: [{ value: '永', color: 'goldenrod' }] }),
  )

  use('天地')
  expect(phraseKey({ text })).toBe(
    hash({
      type: 'phrase',
      graphemes: [
        { value: '天', color: '#000000' },
        { value: ' ', color: '#000000' },
        { value: ' ', color: '#000000' },
        { value: '地', color: '#000000' },
      ],
    }),
  )
  expect(phraseKey({ text, color: '#6cf,' })).toBe(
    hash({
      type: 'phrase',
      graphemes: [
        { value: '天', color: '#66ccff' },
        { value: ' ', color: '#000000' },
        { value: ' ', color: '#000000' },
        { value: '地', color: '#000000' },
      ],
    }),
  )
  expect(phraseKey({ text, color: ',,,goldenrod' })).toBe(
    hash({
      type: 'phrase',
      graphemes: [
        { value: '天', color: '#000000' },
        { value: ' ', color: '#000000' },
        { value: ' ', color: '#000000' },
        { value: '地', color: '#000000' },
      ],
    }),
  )

  expect(phraseKey({ text: '' })).toBe(hash({ type: 'phrase', graphemes: [] }))
})

test('calendar sticker defaults to the requested timezone', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-01T16:30:00.000Z'))

  try {
    expect(getCalendarKey()).toBe(
      hash({
        type: 'calendar',
        date: '2024-01-02',
        color: 'crimson',
        locale: 'zh',
      }),
    )
    expect(getCalendarKey({ color: 'week', timezone: 'America/Los_Angeles' })).toBe(
      hash({
        type: 'calendar',
        date: '2024-01-01',
        color: 'tomato',
        locale: 'zh',
      }),
    )
  } finally {
    vi.useRealTimers()
  }
})
