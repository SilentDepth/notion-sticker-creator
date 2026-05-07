import { sanitize, split } from '@/shared/core/utils.js'

export interface PhraseParams {
  text: string
  color?: string
  max?: number
}

export interface Grapheme {
  value: string
  color: string
}

export const BLANK = { value: ' ', color: '#000000' } satisfies Grapheme

export function createPhraseGraphemes(params: PhraseParams): Grapheme[] {
  params.max ??=
    typeof process !== 'undefined' && process.env.NODE_ENV === 'development' ? Infinity : 9

  const graphemes = parsePhraseParams(params)
  switch (graphemes.length) {
    // Handle 2-char special case, which should be rendered as:
    // A .
    // . B
    case 2:
      graphemes.splice(1, 0, BLANK, BLANK)
      break
    default: {
      if (graphemes.length > params.max) {
        graphemes.splice(params.max, Infinity)
      } else {
        const gridSize = Math.ceil(Math.sqrt(graphemes.length))
        graphemes.push(...Array.from({ length: gridSize ** 2 - graphemes.length }, () => BLANK))
      }
    }
  }
  return graphemes
}

export function createPhraseKey(type: 'phrase', graphemes: Grapheme[]): string {
  return JSON.stringify({
    type,
    text: graphemes.map(g => g.value).join(''),
    color: graphemes.map(g => g.color).join(','),
  })
}

export function normalizePhraseText(raw: string): string {
  // TODO: implement it
  return raw
}

export function normalizePhraseColor(raw: string): string {
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

export function parsePhraseParams(params: PhraseParams): Grapheme[] {
  // Advanced input
  if (params.text.startsWith('#')) {
    const [, text = '', rotate = ''] = params.text.match(/^#(.+)(?!\\)\$(r?)$/su) ?? []
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
      } else if (token.startsWith('\\')) {
        chars.push({ value: sanitize(token.slice(1)), color })
      } else if (token.startsWith('#')) {
        const value = token.slice(1, -1)
        switch (token.slice(-1)) {
          case '=':
            switch (true) {
              case value === '':
                color = '#000000'
                break
              case /^[0-9a-f]{3}([0-9a-f]{3})?$/.test(value):
                color = normalizePhraseColor('#' + value)
                break
              default:
                color = normalizePhraseColor(value)
            }
            break
          case '-':
            chars.push({
              value: tokens[++i],
              color: /^[0-9a-f]{3}([0-9a-f]{3})?$/.test(value) ? '#' + value : value,
            })
            break
        }
      } else {
        chars.push(
          color
            ? { value: token, color: /\s/.test(token) ? '#000000' : color }
            : { value: token, color: '#000000' },
        )
      }
    }
    let rows = chars
      .reduce<Grapheme[][]>(
        (rows, char) => {
          const row = rows[0]
          if (char === '\n' || char === '\\n') {
            rows.unshift([])
          } else {
            row.push(char)
          }
          return rows
        },
        [[]],
      )
      .reverse()
    const maxRowSize = Math.max(...rows.map(row => row.length), rows.length)
    rows.forEach(row => {
      row.push(...Array.from({ length: maxRowSize - row.length }, () => BLANK))
    })
    if (rows.length < maxRowSize) {
      rows.push(
        ...Array.from({ length: maxRowSize - rows.length }, () =>
          Array.from({ length: maxRowSize }, () => BLANK),
        ),
      )
    }
    if (rotate) {
      rows = Array.from({ length: maxRowSize }, (_, idx) => rows.map(row => row[idx]).reverse())
    }

    return rows.flat()
  }

  // Normal input
  const graphemes = split(params.text)
  for (let i = 0; i < graphemes.length; i++) {
    const g = graphemes[i]
    if (g === '\\') {
      graphemes.splice(i, 2, sanitize(graphemes[i + 1] || '\\'))
    }
  }
  const color = params.color || ''
  const colors = color.includes(',')
    ? color.split(',')
    : Array.from({ length: graphemes.length }, () => normalizePhraseColor(color))
  return graphemes.map((value, idx) => ({
    value,
    color: normalizePhraseColor(colors[idx]) || '#000000',
  }))
}
