import satori from 'satori'
import type { FormatEnum } from 'sharp'
import axios from 'axios'

import type { StickerType } from './sticker-types'
import { IMAGE_FRAME, FONT_NOTO_SERIF_SC } from './assets'
import { h, IS_BROWSER } from './utils'
import type { SatoriNode } from './utils'

const sharp = IS_BROWSER ? null as never : require('sharp')

export default abstract class Sticker {
  protected _key: string | undefined

  protected constructor (public type: StickerType) {}

  async renderNode (debug?: boolean): Promise<SatoriNode> {
    return Sticker.frame(null, debug)
  }

  render (debug?: boolean): StickerRenderResult {
    return new StickerRenderResult(async resolve => {
      const svg = await satori(await this.renderNode(debug), {
        width: 512,
        height: 512,
        fonts: [
          { name: 'Noto Serif SC', weight: 400, style: 'normal', data: await FONT_NOTO_SERIF_SC },
        ],
        async loadAdditionalAsset (code: string, segment: string) {
          if (code === 'emoji') {
            const codePoint = [...segment].map(s => s.codePointAt(0)!).filter(c => c < 0xFE00 || 0xFE0F < c).map(c => c.toString(16).padStart(4, '0')).join('_')
            const { data: svg } = await axios(`https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u${codePoint}.svg`, { responseType: 'text' })
            // For browsers
            if (typeof window !== 'undefined') {
              return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`
            }
            // For Node.js
            else {
              // There's a limitation in Sharp to render nested SVG properly. So this is a
              // workaround that pre-convert the SVG image to PNG to make it a plain image.
              // This may hurt the performance, but we don't have other solution.
              // See https://github.com/lovell/sharp/issues/1378
              // TODO: find an other way
              const { default: sharp } = await import('sharp')
              const pngBuffer = await sharp(Buffer.from(svg, 'ascii')).resize({ width: 512, height: 512 }).toFormat('png').toBuffer()
              return `data:image/png;base64,${pngBuffer.toString('base64')}`
            }
          }
        },
      })
      return resolve(svg)
    })
  }

  static KEY_SEPARATOR = ':'

  static async frame (content: SatoriNode | SatoriNode[] | null, debug?: boolean): Promise<SatoriNode> {
    return h('div', { style: 'display: flex; width: 100%; height: 100%' }, [
      debug ? null : h('img', { src: await IMAGE_FRAME, width: '100%', height: '100%', style: 'position: absolute; top: 0; left: 0' }),
      h('div', { style: `display: flex; flex-direction: column; justify-content: center; align-items: center; width: 316px; height: 316px; line-height: 1em; ${debug ? 'background-color: white' : 'transform: translate(128px, 151px) scaleY(0.943) skewY(-3.52deg)'}; transform-origin: top left` },
        content
      ),
    ])
  }
}

class StickerRenderResult extends Promise<string> {
  async toBuffer (format: keyof FormatEnum = 'svg'): Promise<Buffer> {
    if (IS_BROWSER) {
      throw new Error('Buffering sticker is not supported on browsers')
    }

    const svgBuffer = Buffer.from(await this, 'utf-8')
    return format === 'svg'
      ? svgBuffer
      : await sharp(svgBuffer).toFormat(format).toBuffer()
  }
}
