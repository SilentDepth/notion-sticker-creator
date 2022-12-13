import { h } from './utils'
import Phrase from './templates/phrase'
import Calendar from './templates/calendar'
import CssIsAwesome from './templates/css-is-awesome'

export type Template = 'phrase' | 'calendar' | 'css-is-awesome'

const Template: Record<Template, Function> = {
  phrase: Phrase,
  calendar: Calendar,
  'css-is-awesome': CssIsAwesome,
}

interface Props<T> {
  input: T
  frame: string
  template?: Template
  params?: Record<string, unknown>
}

export default function<T> ({ input, frame, template = 'phrase', params }: Props<T>, debug?: boolean) {
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
      Template[template](
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
