import { expect, test, vi } from 'vite-plus/test'
import { parseQuery } from '@/server/query'
import CalendarSticker from '@/shared/core/sticker-types/calendar'
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

test('phrase sticker key', () => {
  let text!: string
  let normalizedText!: string
  function use(newText: string, textToKey?: string) {
    text = newText
    normalizedText = textToKey || text
  }

  use('永')
  expect(phraseKey({ text })).toBe(
    JSON.stringify({ type: 'phrase', text: normalizedText, color: '#000000' }),
  )
  expect(phraseKey({ text, color: '#66ccff' })).toBe(
    JSON.stringify({ type: 'phrase', text: normalizedText, color: '#66ccff' }),
  )
  expect(phraseKey({ text, color: '#6cf' })).toBe(
    JSON.stringify({ type: 'phrase', text: normalizedText, color: '#66ccff' }),
  )
  expect(phraseKey({ text, color: 'goldenrod' })).toBe(
    JSON.stringify({ type: 'phrase', text: normalizedText, color: 'goldenrod' }),
  )

  use('天地', '天  地')
  expect(phraseKey({ text })).toBe(
    JSON.stringify({
      type: 'phrase',
      text: normalizedText,
      color: '#000000,#000000,#000000,#000000',
    }),
  )
  expect(phraseKey({ text, color: '#6cf,' })).toBe(
    JSON.stringify({
      type: 'phrase',
      text: normalizedText,
      color: '#66ccff,#000000,#000000,#000000',
    }),
  )
  expect(phraseKey({ text, color: ',,,goldenrod' })).toBe(
    JSON.stringify({
      type: 'phrase',
      text: normalizedText,
      color: '#000000,#000000,#000000,#000000',
    }),
  )

  expect(phraseKey({ text: '' })).toBe(JSON.stringify({ type: 'phrase', text: '', color: '' }))
})

test('calendar sticker defaults to the requested timezone', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-01T16:30:00.000Z'))

  try {
    expect(new CalendarSticker().key).toBe(
      JSON.stringify({
        type: 'calendar',
        date: '2024-01-02',
        color: 'crimson',
        locale: 'zh',
      }),
    )
    expect(new CalendarSticker({ color: 'week', timezone: 'America/Los_Angeles' }).key).toBe(
      JSON.stringify({
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
