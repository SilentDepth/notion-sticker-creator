import Sticker from '../sticker.js'
import { h } from '../utils.js'
import { IMAGE_NOTION } from '../assets.js'

export default class CssIsAwesomeSticker extends Sticker {
  constructor () {
    super('notion')
  }

  get key (): string {
    return JSON.stringify({ type: this.type })
  }

  async renderNode () {
    return (
      h('div', { style: 'display: flex; width: 100%; height: 100%' },
        h('img', { src: await IMAGE_NOTION, width: '100%', height: '100%', style: 'position: absolute; top: 0; left: 0' })
      )
    )
  }
}
