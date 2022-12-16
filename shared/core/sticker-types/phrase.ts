import Sticker from '../sticker'
import { encodeBase64url, h, sanitize, split } from '../utils'

interface Params {
  text: string
  color?: string
  max?: number
}

interface Grapheme {
  value: string
  color: string
}

const BLANK = { value: ' ', color: '#000000' }

export default class PhraseSticker extends Sticker {
  readonly graphemes: Grapheme[]

  constructor (params: Params) {
    super('phrase')

    params.max ??= 9

    this.graphemes = PhraseSticker.parseParams(params)
    switch (this.graphemes.length) {
      // Handle 2-char special case, which should be rendered as:
      // A .
      // . B
      case 2:
        this.graphemes.splice(1, 0, BLANK, BLANK)
        break
      default: {
        if (this.graphemes.length > params.max) {
          this.graphemes.splice(params.max, Infinity)
        } else {
          const gridSize = Math.ceil(Math.sqrt(this.graphemes.length))
          this.graphemes.push(...new Array(gridSize ** 2 - this.graphemes.length).fill(BLANK))
        }
      }
    }
  }

  get key (): string {
    this._key ??= [
      this.type,
      encodeBase64url(this.graphemes.map(g => g.value).join('')),
      this.graphemes.map(g => g.color).join(','),
    ].join(Sticker.KEY_SEPARATOR)
    return this._key
  }

  renderNode (debug?: boolean) {
    const rowSize = Math.ceil(Math.sqrt(this.graphemes.length))
    const fontSize = 316 / (rowSize + 0.5)
    return Sticker.frame(Array.from({ length: rowSize }, (_, rowIdx) => {
      return h('div', { style: 'display: flex' },
        Array.from({ length: rowSize }, (_, colIdx) => {
          const graphemeIdx = rowIdx * rowSize + colIdx
          return h('div', { style: `display: flex; justify-content: center; width: 1em; height: 1em; font-size: ${fontSize}px; color: ${this.graphemes[graphemeIdx].color}; ${debug ? 'box-shadow: 0 0 0 1px #f0f' : ''}` },
            h('span', { style: 'height: 100%; transform: translateY(-7.1429%)' }, this.graphemes[graphemeIdx].value)
          )
        })
      )
    }), debug)
  }

  static normalizeText (raw: string): string {
    // TODO: implement it
    return raw
  }

  static normalizeColor (raw: string): string {
    if (!raw) {
      return '#000000'
    }
    if (/^#[0-9a-f]{6}$/.test(raw)) {
      return raw
    }
    if (/^#[0-9a-f]{3}$/.test(raw)) {
      return raw.replaceAll(/([0-9a-f])/g, '$1$1')
    }
    // TODO: translate html color names
    return raw
  }

  static parseParams (params: Params): Grapheme[] {
    // Advanced input
    if (params.text.startsWith('#')) {
      const [, text = '', rotate = ''] = params.text.match(/^#(.+)(?!\\)\$(r?)$/us) ?? []
      const graphemes = split(text)
      const tokens = [] as string[]
      for (let i = 0, max = graphemes.length - 1; i <= max; i++) {
        switch (graphemes[i]) {
          case '\\':
            tokens.push(graphemes[i] + graphemes[++i])
            break
          case '#': {
            let token = '#'
            const _i = i
            let c = graphemes[++i]
            while (c !== '=' && c !== '-') {
              if (c !== undefined) {
                token += c
                c = graphemes[++i]
              } else {
                token = '\\#'
                c = ''
                i = _i
                break
              }
            }
            token += c
            tokens.push(token)
            break
          }
          default:
            tokens.push(graphemes[i])
        }
      }
      const chars = [] as Array<Grapheme | '\n' | '\\n'>
      let color: string = '#000000'
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        if (token === '\n' || token === '\\n') {
          chars.push(token)
        }
        else if (token.startsWith('\\')) {
          chars.push({ value: sanitize(token.slice(1)), color })
        }
        else if (token.startsWith('#')) {
          const value = token.slice(1, -1)
          switch (token.slice(-1)) {
            case '=':
              switch (true) {
                case value === '':
                  color = '#000000'
                  break
                case /^[0-9a-f]{3}([0-9a-f]{3})?$/.test(value):
                  color = PhraseSticker.normalizeColor('#' + value)
                  break
                default:
                  color = PhraseSticker.normalizeColor(value)
              }
              break
            case '-':
              chars.push({ value: tokens[++i], color: /^[0-9a-f]{3}([0-9a-f]{3})?$/.test(value) ? '#' + value : value })
              break
          }
        }
        else {
          chars.push(
            color
              ? { value: token, color: /\s/.test(token) ? '#000000' : color }
              : { value: token, color: '#000000' }
          )
        }
      }
      let rows = chars.reduce<Grapheme[][]>((rows, char) => {
        const row = rows[0]
        if (char === '\n' || char === '\\n') {
          rows.unshift([])
        } else {
          row.push(char)
        }
        return rows
      }, [[]]).reverse()
      const maxRowSize = Math.max(...rows.map(row => row.length))
      rows.forEach(row => {
        row.push(...new Array(maxRowSize - row.length).fill(BLANK))
      })
      if (rows.length < maxRowSize) {
        rows.push(...new Array(maxRowSize - rows.length).fill(new Array(maxRowSize).fill(BLANK)))
      }
      if (rotate) {
        rows = Array.from({ length: maxRowSize }, (_, idx) => rows.map(row => row[idx]).reverse())
      }

      return rows.flat()
    }
    // Normal input
    else {
      const graphemes = split(params.text)
      for (let i = 0; i < graphemes.length; i++) {
        const g = graphemes[i]
        if (g === '\\') {
          graphemes.splice(i, 2, sanitize(graphemes[i + 1] || '\\'))
        }
      }
      const color = params.color || ''
      const colors = color.includes(',') ? color.split(',') : new Array(graphemes.length).fill(PhraseSticker.normalizeColor(color))
      return graphemes.map((value, idx) => ({ value, color: PhraseSticker.normalizeColor(colors[idx]) || '#000000' }))
    }
  }
}
