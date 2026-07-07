import { hash } from 'ohash'
import { renderUnicode } from 'uqr'
import { Component as PhraseComponent } from '@/shared/core/sticker-types/phrase.js'

export interface Params {
  data: string
}

export const getKey = (params: Params) => hash({ type: 'qrcode', data: params.data })

export interface ComponentProps extends Params {
  debug?: boolean
}

export function Component({ data, debug }: ComponentProps) {
  const text = renderUnicode(data, { blackChar: '█', whiteChar: ' ' }).replaceAll('\n', '')
  return PhraseComponent({ text, debug })
}
