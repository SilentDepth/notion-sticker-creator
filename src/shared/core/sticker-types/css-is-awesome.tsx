import Sticker from '@/shared/core/sticker.js'

export default class CssIsAwesomeSticker extends Sticker {
  constructor() {
    super('css-is-awesome')
  }

  get key(): string {
    return JSON.stringify({ type: this.type })
  }

  renderNode(debug?: boolean) {
    return Sticker.frame(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '4px 12px',
          fontSize: '81px',
        }}
      >
        <span>CSS</span>
        <span style={{ margin: 'auto 0' }}>IS</span>
        <span>AWESOME</span>
      </div>,
      debug,
    )
  }
}
