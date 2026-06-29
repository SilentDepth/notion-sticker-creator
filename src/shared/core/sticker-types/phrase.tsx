import {
  createPhraseGraphemes,
  createPhraseKey,
  normalizePhraseColor,
  normalizePhraseText,
  parsePhraseParams,
  type Grapheme,
  type PhraseParams,
} from '@/shared/core/sticker-types/phrase-data.js'
import Sticker from '@/shared/core/sticker.js'

export default class PhraseSticker extends Sticker {
  readonly graphemes: Grapheme[]

  constructor(params: PhraseParams) {
    super('phrase')

    this.graphemes = createPhraseGraphemes(params)
  }

  get key(): string {
    this._key ??= createPhraseKey('phrase', this.graphemes)
    return this._key
  }

  renderNode(debug?: boolean) {
    const rowSize = Math.ceil(Math.sqrt(this.graphemes.length))
    const fontSize = 316 / (rowSize + 0.5)
    return Sticker.frame(
      Array.from({ length: rowSize }, (_, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex' }}>
          {Array.from({ length: rowSize }, (_, colIdx) => {
            const gIdx = rowIdx * rowSize + colIdx
            return (
              <div
                key={colIdx}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '1em',
                  height: '1em',
                  fontSize,
                  lineHeight: 1,
                  color: this.graphemes[gIdx].color,
                  ...(debug
                    ? { background: '#f0f3', outline: '1px solid #f0f', outlineOffset: -1 }
                    : {}),
                }}
              >
                <div
                  style={{
                    translate: /\p{Extended_Pictographic}/u.test(this.graphemes[gIdx].value)
                      ? '-10% 0'
                      : '0 -5%',
                  }}
                >
                  {this.graphemes[gIdx].value}
                </div>
              </div>
            )
          })}
        </div>
      )),
      debug,
    )
  }

  static normalizeText(raw: string): string {
    return normalizePhraseText(raw)
  }

  static normalizeColor(raw: string): string {
    return normalizePhraseColor(raw)
  }

  static parseParams(params: PhraseParams): Grapheme[] {
    return parsePhraseParams(params)
  }
}
