import { h, split } from '../utils'

const MAX = 9
const DEFAULT_COLOR = '#000'
const BLANK = { value: '' }

interface Props {
  input?: string
  /**
   * Hints for grapheme positioning
   *
   * @example
   * "159" => A . .
   *          . B .
   *          . . C
   * @example
   * "951" => C . .
   *          . B .
   *          . . A
   */
  layout?: string
  color?: string
  /** Text region padding in em. Default to 0.25em */
  padding?: number
  /** Text baseline offset in em. Default to 17/238em */
  offset?: number
  style?: string
}

export default function ({ input = '', layout, color = '', padding = 0.25, offset = 17 / 238, style = '' }: Props, debug?: boolean) {
  const graphemes = split(input).slice(0, MAX)
  const colors = color.includes(',') ? color.split(',') : new Array(graphemes.length).fill(color)
  let rowSize: number
  let positions: number[]

  if (layout) {
    positions = layout.split('').map(Number)
    rowSize = Math.ceil(Math.sqrt(Math.max(graphemes.length, ...positions)))
  } else {
    rowSize = Math.ceil(Math.sqrt(graphemes.length))
    switch (graphemes.length) {
      case 2:
        positions = [1, 4]
        break
      default:
        positions = Array.from({ length: rowSize ** 2 }, (_, idx) => idx + 1)
    }
  }

  type Char = { value: string, color?: string }
  const cells = positions.reduce(
    (cells, order, idx) => {
      cells[order - 1] = { value: graphemes[idx], color: colors[idx] || DEFAULT_COLOR }
      return cells
    },
    new Array<Char>(rowSize ** 2).fill(BLANK),
  )
  const rows = cells.reduce((groups, grapheme, idx) => {
    if (idx % rowSize === 0) {
      groups.unshift([])
    }
    groups[0].push(grapheme)
    return groups
  }, [] as Char[][]).reverse()

  const fontSize = 316 / (rowSize + padding * 2)

  return h(
    'div',
    { style: `${style}; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: ${fontSize}px` },
    rows.map(group => h(
      'div',
      { style: 'display: flex' },
      group.map(grapheme => h(
        'span',
        { style: `display: flex; justify-content: center; width: 1em; height: 1em; color: ${grapheme.color}; ${debug ? 'box-shadow: 0 0 0 1px #f0f' : ''}` },
        h('span', { style: `transform: translateY(${-1 * fontSize * offset}px)` }, grapheme.value),
      )),
    )),
  )
}
