import { IMAGE_NOTION } from '@/shared/core/assets'
import Sticker from '@/shared/core/sticker'

export default class CssIsAwesomeSticker extends Sticker {
  constructor() {
    super('notion')
  }

  get key(): string {
    return JSON.stringify({ type: this.type })
  }

  async renderNode() {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <img
          src={IMAGE_NOTION}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    )
  }
}
