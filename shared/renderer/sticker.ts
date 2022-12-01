import { h } from './utils'
import Phrase from './templates/phrase'

interface Props {
  input: string
  frame: string
  params?: Record<string, unknown>
}

export default function ({ input, frame, params }: Props, debug?: boolean) {
  return h(
    'div',
    { style: 'display: flex; width: 100%; height: 100%' },
    [
      debug ? null : h('img', {
        src: frame,
        width: '100%',
        height: '100%',
        style: 'position: absolute; top: 0; left: 0',
      }),
      Phrase(
        {
          input,
          ...params,
          style: `width: 316px; height: 316px; line-height: 1em; ${debug ? '' : `transform: translate(128px, 151px) scaleY(0.943) skewY(-3.52deg)`}; transform-origin: top left; ${debug ? 'background-color: #fff' : ''}`,
        },
        debug,
      ),
    ],
  )
}
