import { renderUnicode } from 'uqr'
import Sticker from '../sticker.js'
import PhraseSticker from './phrase.js'

interface Params {
  data: string
}

export default class QrcodeSticker extends Sticker {
  readonly data: string
  readonly content: string

  constructor (params: Params) {
    super('qrcode')

    this.data = params.data
    this.content = renderUnicode(params.data, { blackChar: '█', whiteChar: ' ' }).replaceAll('\n', '')
  }

  get key (): string {
    return JSON.stringify({
      type: this.type,
      data: this.data
    })
  }

  renderNode () {
    const phraseSticker = new PhraseSticker({ text: this.content })
    return phraseSticker.renderNode()
  }
}
