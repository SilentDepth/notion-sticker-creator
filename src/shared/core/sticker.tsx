import type { ReactNode } from 'react'
import { uint8ArrayToBase64 } from 'uint8array-extras'
import { IMAGE_FRAME, loadNotoSerifScFont } from '@/shared/core/assets'
import type { StickerType } from '@/shared/core/sticker-types'
import { SupportedFormat } from '@/shared/core/utils'

export default abstract class Sticker {
  protected _key: string | undefined

  protected constructor(public type: StickerType) {}

  async renderNode(debug?: boolean): Promise<ReactNode> {
    return Sticker.frame(null, debug)
  }

  render(debug?: boolean): StickerRenderResult {
    return new StickerRenderResult(async resolve => {
      const { default: satori } = await import('@/libs/satori')
      const node = (await this.renderNode(debug)) as Parameters<typeof satori>[0]
      const svg = await satori(node, {
        width: 512,
        height: 512,
        fonts: [
          {
            name: 'Noto Serif SC',
            weight: 400,
            style: 'normal',
            data: await loadNotoSerifScFont(),
          },
        ],
        async loadAdditionalAsset(code: string, segment: string): Promise<string> {
          if (code === 'emoji') {
            const codePoint = Array.from(segment)
              .map(s => s.codePointAt(0)!)
              .filter(c => c < 0xfe00 || 0xfe0f < c)
              .map(c => c.toString(16).padStart(4, '0'))
              .join('_')
            const svg = await fetch(
              `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u${codePoint}.svg`,
            )
              .then(response => (response.ok ? response.text() : null))
              .catch(() => null)
            if (!svg) return ''
            // For browsers
            if (!import.meta.env.SSR) {
              return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`
            }
            // For server-side
            else {
              // TODO: Check if resvg supports nested svg
              const { default: Resvg } = await import('@/libs/resvg')
              const png = new Resvg(svg).render().asPng()
              return `data:image/png;base64,${uint8ArrayToBase64(png)}`
            }
          }

          return ''
        },
      })
      return resolve(svg)
    })
  }

  static async frame(content: ReactNode, debug?: boolean): Promise<ReactNode> {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        {!debug && (
          <img
            src={IMAGE_FRAME}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
        <div
          style={{
            width: 316,
            height: 316,
            lineHeight: '1em',
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

class StickerRenderResult extends Promise<string> {
  async toBuffer(format: SupportedFormat = SupportedFormat.svg): Promise<Uint8Array> {
    if (!import.meta.env.SSR) {
      throw new Error('Buffering sticker is not supported on browsers')
    }

    const svg = await this
    const svgBuf = new TextEncoder().encode(svg)
    if (format === SupportedFormat.svg) return svgBuf

    const { default: Resvg } = await import('@/libs/resvg')
    const rendered = new Resvg(svg).render()
    if (format === SupportedFormat.png) return rendered.asPng()

    const { default: webp } = await import('@/utils/webp')
    return (await webp()).encode(
      bleedAlpha(rendered.pixels, rendered.width, rendered.height),
      rendered.width,
      rendered.height,
      {
        lossless: 1,
        exact: 1,
        alpha_quality: 100,
        near_lossless: 100,
      },
    )
  }
}

function bleedAlpha(rgba: Uint8Array, width: number, height: number, iterations = 4) {
  const out = new Uint8Array(rgba)

  for (let iter = 0; iter < iterations; iter++) {
    const prev = new Uint8Array(out)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        const a = prev[i + 3]

        if (a >= 255) continue

        let r = 0,
          g = 0,
          b = 0,
          count = 0

        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

          const ni = (ny * width + nx) * 4
          const na = prev[ni + 3]

          if (na > a) {
            r += prev[ni]
            g += prev[ni + 1]
            b += prev[ni + 2]
            count++
          }
        }

        if (count > 0) {
          out[i] = Math.round(r / count)
          out[i + 1] = Math.round(g / count)
          out[i + 2] = Math.round(b / count)
        }
      }
    }
  }

  return out
}
