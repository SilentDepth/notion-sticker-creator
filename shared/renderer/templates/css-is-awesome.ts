import { h } from '../utils'

export default function ({ style = '' }) {
  return h(
    'div',
    { style: `${style}; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 4px 12px; font-size: 81px` },
    [
      h('span', {}, 'CSS'),
      h('span', { style: 'margin: auto 0' }, 'IS'),
      h('span', {}, 'AWESOME'),
    ],
  )
}
