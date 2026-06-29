import type { ReactNode } from 'react'
import type { RenderOptions } from 'takumi-js'
import { IMAGE_FRAME, loadNotoSerifScFont } from '@/shared/core/assets'
import type { StickerType } from '@/shared/core/sticker-types'
import { SupportedFormat } from '@/shared/core/utils'

const STICKER_SIZE = 512
const CANVAS_SIZE = 316

export default abstract class Sticker {
  protected _key: string | undefined

  protected constructor(public type: StickerType) {}

  async renderNode(debug?: boolean): Promise<ReactNode> {
    return Sticker.frame(null, debug)
  }

  render(debug?: boolean): StickerRenderResult<string>
  render(format: SupportedFormat.svg, debug?: boolean): StickerRenderResult<string>
  render(format: SupportedFormat, debug?: boolean): StickerRenderResult<Uint8Array>
  render(
    arg0?: SupportedFormat | boolean,
    arg1?: boolean,
  ): StickerRenderResult<string | Uint8Array> {
    const format: SupportedFormat | undefined =
      typeof arg0 === 'boolean' ? SupportedFormat.svg : arg0
    const debug: boolean | undefined = typeof arg0 === 'boolean' ? arg0 : arg1

    return new StickerRenderResult(async resolve => {
      const { render, renderSvg } = await import('takumi-js')
      const node = (await this.renderNode(debug)) as Parameters<typeof render>[0]
      const options = {
        width: STICKER_SIZE,
        height: STICKER_SIZE,
        emoji: 'noto',
        fonts: [
          {
            name: 'Noto Serif SC',
            weight: 400,
            style: 'normal',
            data: await loadNotoSerifScFont(),
          },
        ],
      } as RenderOptions

      switch (format) {
        case SupportedFormat.png:
          resolve(render(node, { ...options, format: 'png' }))
          return
        case SupportedFormat.webp:
          resolve(render(node, { ...options, format: 'webp', lossless: true }))
          return
        case SupportedFormat.svg:
        default:
          resolve(renderSvg(node, options))
          return
      }
    })
  }

  static async frame(content: ReactNode, debug?: boolean): Promise<ReactNode> {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        {!debug && (
          <img
            src={IMAGE_FRAME}
            width={STICKER_SIZE}
            height={STICKER_SIZE}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
        <div
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            ...(debug
              ? { backgroundColor: 'white' }
              : {
                  transform: 'translate(128px, 151px) scaleY(0.943) skewY(-3.52deg)',
                  transformOrigin: 'top left',
                }),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {content}
        </div>
      </div>
    )
  }
}

class StickerRenderResult<T extends string | Uint8Array> extends Promise<T> {
  async toBuffer(): Promise<Uint8Array> {
    if (!import.meta.env.SSR) {
      throw new Error('Buffering sticker is not supported on browsers')
    }

    const result = await this
    if (typeof result === 'string') return new TextEncoder().encode(result)
    else return result
  }
}
