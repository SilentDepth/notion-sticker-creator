import { hash } from 'ohash'
import { expect, test } from 'vite-plus/test'
import {
  BLANK,
  createPhraseKey,
  layoutPhraseGraphemes,
  normalizePhraseColor,
  normalizePhraseParams,
  parsePhraseInput,
} from '@/shared/core/sticker-types/phrase-data'

test('normalizes phrase params without mutating input', () => {
  const params = { text: '永', color: '#6cf' }

  expect(normalizePhraseParams(params)).toEqual({
    text: '永',
    color: '#6cf',
    max: 9,
  })
  expect(params).toEqual({ text: '永', color: '#6cf' })
})

test('normalizes phrase colors', () => {
  expect(normalizePhraseColor('')).toBe('#000000')
  expect(normalizePhraseColor('#6cf')).toBe('#66ccff')
  expect(normalizePhraseColor('#66ccff')).toBe('#66ccff')
  expect(normalizePhraseColor('goldenrod')).toBe('goldenrod')
})

test('parses normal phrase input', () => {
  expect(parsePhraseInput({ text: '天地', color: '#6cf,' })).toEqual([
    { value: '天', color: '#66ccff' },
    { value: '地', color: '#000000' },
  ])
  expect(parsePhraseInput({ text: String.raw`\#`, color: '' })).toEqual([
    { value: '#', color: '#000000' },
  ])
})

test('layouts phrase graphemes', () => {
  expect(
    layoutPhraseGraphemes(
      [
        { value: '天', color: '#000000' },
        { value: '地', color: '#000000' },
      ],
      9,
    ),
  ).toEqual([{ value: '天', color: '#000000' }, BLANK, BLANK, { value: '地', color: '#000000' }])

  expect(
    layoutPhraseGraphemes(
      [
        { value: '天', color: '#000000' },
        { value: '地', color: '#000000' },
        { value: '玄', color: '#000000' },
        { value: '黄', color: '#000000' },
      ],
      3,
    ),
  ).toEqual([
    { value: '天', color: '#000000' },
    { value: '地', color: '#000000' },
    { value: '玄', color: '#000000' },
  ])
})

test('creates phrase key from layout output', () => {
  const graphemes = [
    { value: '天', color: '#000000' },
    BLANK,
    BLANK,
    { value: '地', color: '#000000' },
  ]

  expect(createPhraseKey('phrase', graphemes)).toBe(hash({ type: 'phrase', graphemes }))
})
