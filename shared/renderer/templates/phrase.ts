import { h, split } from '../utils'

const MAX = 9
const DEFAULT_COLOR = '#000'
const BLANK = { value: '' }

interface Props {
  input?: string
  color?: string
  /** Text region padding in em. Default to 0.25em */
  padding?: number
  /** Text baseline offset in em. Default to 17/238em */
  offset?: number
  style?: string
}

export default function ({ input = '', color = '', padding = 0.25, offset = 17 / 238, style = '' }: Props, debug?: boolean) {
  const graphemes = split(input)
  const colors = color.includes(',') ? color.split(',') : new Array(graphemes.length).fill(color)

  type Char = { value: string, color?: string }
  let chars: Char[] = graphemes.map((value, idx) => ({ value, color: colors[idx] }))
  switch (chars.length) {
    case 0:
      chars = [BLANK]
      break
    case 1:
      break
    case 2:
      chars.splice(1, 0, BLANK, BLANK)
      break
    case 3:
      chars.push(BLANK)
      break
    case 4:
      break
    case 5:
    case 6:
    case 7:
    case 8:
      chars.push(...new Array(MAX - chars.length).fill(BLANK))
      break
    case 9:
      break
    default:
      chars = chars.slice(0, MAX)
  }

  const groupSize = Math.ceil(Math.sqrt(chars.length))
  const groups = chars.reduce<any[][]>((groups, grapheme, idx) => {
    if (idx % groupSize === 0) {
      groups.unshift([])
    }
    groups[0].push(grapheme)
    return groups
  }, []).reverse()

  const fontSize = 316 / (groupSize + padding * 2)

  return h(
    'div',
    { style: `${style}; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: ${fontSize}px` },
    groups.map(group => h(
      'div',
      { style: 'display: flex' },
      group.map(grapheme => h(
        'span',
        { style: `display: flex; justify-content: center; width: 1em; height: 1em; color: ${grapheme.color || DEFAULT_COLOR}; ${debug ? 'box-shadow: 0 0 0 1px #f0f' : ''}` },
        h('span', { style: `transform: translateY(${-1 * fontSize * offset}px)` }, grapheme.value),
      )),
    )),
  )
}
