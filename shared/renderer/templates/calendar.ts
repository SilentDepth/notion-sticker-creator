import { h } from '../utils'

interface Props {
  input?: string | Date
  color?: string
  /** Text baseline offset in em. Default to 17/238em */
  // TODO: DRY-it
  offset?: number
  style?: string
}

export default function ({ input = new Date(), color = '#000', offset = 17 / 238, style = '' }: Props, debug?: boolean) {
  const date = typeof input === 'string' && input ? new Date(input) : new Date()

  return h(
    'div',
    { style: `${style}; display: flex; flex-direction: column; justify-content: center; align-items: center` },
    [
      h(
        'span',
        { style: `font-size: 50px; height: 1em; transform: translateY(-${50 * offset}px)` },
        `${date.getFullYear()} · ${date.getMonth() + 1}`,
      ),
      h(
        'span',
        { style: `margin: 7px 0; font-size: 150px; height: 1em; color: ${color}; transform: translateY(-${150 * offset}px); ${debug ? 'box-shadow: 0 0 0 1px #f0f' : ''}` },
        String(date.getDate()),
      ),
      h(
        'span',
        { style: `font-size: 50px; height: 1em; transform: translateY(-${50 * offset}px)` },
        `星期${'日一二三四五六'[date.getDay()]}`,
      ),
    ],
  )
}
