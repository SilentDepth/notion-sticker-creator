import { expect, test } from 'vitest'

import { createSticker, parseQuery } from '../../api/bot-hook'

test('parseQuery', () => {
  expect(parseQuery('天地玄黄')).toEqual({ 0: '天地玄黄' })
  expect(parseQuery('天地玄黄 foo=lorem bar=ipsum')).toEqual({ 0: '天地玄黄', foo: 'lorem', bar: 'ipsum' })
  expect(parseQuery('$phrase 天地玄黄')).toEqual({ $: 'phrase', 0: '天地玄黄' })
  expect(parseQuery('$phrase 天地玄黄 foo=lorem bar=ipsum')).toEqual({ $: 'phrase', 0: '天地玄黄', foo: 'lorem', bar: 'ipsum' })
  expect(parseQuery('天地玄黄 宇宙洪荒')).toEqual({ 0: '天地玄黄', 1: '宇宙洪荒' })
  expect(parseQuery('天地玄黄 foo=lorem 宇宙洪荒')).toEqual({ 0: '天地玄黄', 1: '宇宙洪荒', foo: 'lorem' })
  expect(parseQuery('天地玄黄\\ 宇宙洪荒')).toEqual({ 0: '天地玄黄\\ 宇宙洪荒' })
  expect(parseQuery('天地玄黄 foo=宇宙\\ 洪荒')).toEqual({ 0: '天地玄黄', foo: '宇宙\\ 洪荒' })
  expect(parseQuery('$')).toEqual({ 0: '$' })
  expect(parseQuery('\\$phrase')).toEqual({ 0: '\\$phrase' })
})

test('createSticker', () => {
  let text!: string
  let encoded!: string
  function use (newText: string, textToEncode?: string) {
    text = newText
    encoded = Buffer.from(textToEncode || text).toString('base64url')
  }

  use('永')
  expect(createSticker('phrase', { text }).key).toBe(`phrase:${encoded}:#000000`)
  expect(createSticker('phrase', { text, color: '#66ccff' }).key).toBe(`phrase:${encoded}:#66ccff`)
  expect(createSticker('phrase', { text, color: '#6cf' }).key).toBe(`phrase:${encoded}:#66ccff`)
  expect(createSticker('phrase', { text, color: 'goldenrod' }).key).toBe(`phrase:${encoded}:#daa520`)

  use('天地', '天地  ')
  expect(createSticker('phrase', { text }).key).toBe(`phrase:${encoded}:#000000,#000000,#000000,#000000`)
  expect(createSticker('phrase', { text, color: '#6cf,' }).key).toBe(`phrase:${encoded}:#66ccff,#000000,#000000,#000000`)
  expect(createSticker('phrase', { text, color: ',,,goldenrod' }).key).toBe(`phrase:${encoded}:#000000,#000000,#000000,#daa520`)

  expect(createSticker('phrase', { text: '' }).key).toBe('phrase::')
})
