import Sticker from "../sticker"
import { h } from "../utils"

export default class CssIsAwesomeSticker extends Sticker {
  constructor () {
    super('css-is-awesome')
  }

  get key (): string {
    return 'css-is-awesome'
  }

  renderNode (debug?: boolean) {
    return Sticker.frame(
      h('div', { style: 'display: flex; flex-direction: column; width: 100%; height: 100%; padding: 4px 12px; font-size: 81px' }, [
        h('span', {}, 'CSS'),
        h('span', { style: 'margin: auto 0' }, 'IS'),
        h('span', {}, 'AWESOME'),
      ]),
      debug,
    )
  }
}
