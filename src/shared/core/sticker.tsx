import type { ReactNode } from 'react'
import type { RenderOptions } from 'takumi-js'
import { IMAGE_FRAME, loadNotoSerifScFont, type StickerRenderContext } from '@/shared/core/assets'
import { SupportedFormat } from '@/shared/core/utils'

const STICKER_SIZE = 512
const CANVAS_SIZE = 316

export default interface Sticker<T extends string = string> {
  readonly key: string
  readonly type: T
  render(debug?: boolean, context?: StickerRenderContext): StickerRenderResult<string>
  render(
    format: SupportedFormat.svg,
    debug?: boolean,
    context?: StickerRenderContext,
  ): StickerRenderResult<string>
  render(
    format: SupportedFormat,
    debug?: boolean,
    context?: StickerRenderContext,
  ): StickerRenderResult<Uint8Array>
  renderNode(debug?: boolean): Promise<ReactNode> | ReactNode
}

export interface StickerComponentDefinition<T extends string, P extends object> {
  Component: (props: P & { debug?: boolean }) => ReactNode
  getKey: (params: P) => string
  type: T
}

export function createStickerRenderer<T extends string, P extends object>(
  definition: StickerComponentDefinition<T, P>,
  params: P,
): Sticker<T> {
  const renderNode = (debug?: boolean) => definition.Component({ ...params, debug })
  const render = (
    arg0?: SupportedFormat | boolean,
    arg1?: boolean | StickerRenderContext,
    arg2: StickerRenderContext = {},
  ) => renderStickerNode(renderNode, arg0, arg1, arg2)

  return {
    type: definition.type,
    get key() {
      return definition.getKey(params)
    },
    render: render as Sticker<T>['render'],
    renderNode,
  }
}

export function renderStickerNode(
  renderNode: (debug?: boolean) => Promise<ReactNode> | ReactNode,
  arg0?: SupportedFormat | boolean,
  arg1?: boolean | StickerRenderContext,
  arg2: StickerRenderContext = {},
): StickerRenderResult<string | Uint8Array> {
  const format: SupportedFormat | undefined = typeof arg0 === 'boolean' ? SupportedFormat.svg : arg0
  const debug: boolean | undefined =
    typeof arg0 === 'boolean' ? arg0 : typeof arg1 === 'boolean' ? arg1 : undefined
  const context = typeof arg1 === 'object' ? arg1 : arg2

  return new StickerRenderResult((resolve, reject) => {
    void (async () => {
      const { render, renderSvg } = await import('takumi-js')
      const node = (await renderNode(debug)) as Parameters<typeof render>[0]
      const options = {
        width: STICKER_SIZE,
        height: STICKER_SIZE,
        emoji: 'noto',
        fonts: [
          {
            name: 'Noto Serif SC',
            weight: 400,
            style: 'normal',
            data: await loadNotoSerifScFont(context),
          },
        ],
      } as RenderOptions

      switch (format) {
        case SupportedFormat.png:
          resolve(await render(node, { ...options, format: 'png' }))
          return
        case SupportedFormat.webp:
          resolve(await render(node, { ...options, format: 'webp', lossless: true }))
          return
        case SupportedFormat.svg:
        default:
          resolve(await renderSvg(node, options))
          return
      }
    })().catch(reject)
  })
}

export async function frame(content: ReactNode, debug?: boolean): Promise<ReactNode> {
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
