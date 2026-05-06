import { renderUnicode } from 'uqr'
import PhraseSticker from '@/shared/core/sticker-types/phrase.js'
import Sticker from '@/shared/core/sticker.js'

interface Params {
  data: string
}

export default class QrcodeSticker extends Sticker {
  readonly data: string

  constructor(params: Params) {
    super('qrcode')

    this.data = params.data
  }

  get key(): string {
    return JSON.stringify({
      type: this.type,
      data: this.data,
    })
  }

  renderNode() {
    const text = renderUnicode(this.data, { blackChar: '█', whiteChar: ' ' }).replaceAll('\n', '')
    const phraseSticker = new PhraseSticker({ text })
    return phraseSticker.renderNode()
  }
}
