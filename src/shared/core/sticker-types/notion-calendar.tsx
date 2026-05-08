import { IMAGE_NOTION_CALENDAR } from '@/shared/core/assets.js'
import Sticker from '@/shared/core/sticker.js'

export default class CssIsAwesomeSticker extends Sticker {
  constructor() {
    super('notion-calendar')
  }

  get key(): string {
    return JSON.stringify({ type: this.type })
  }

  async renderNode() {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <img
          src={IMAGE_NOTION_CALENDAR}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    )
  }
}
