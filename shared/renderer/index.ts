import satori from 'satori'
import axios from 'axios'

import loadAssets from './load-assets'
import Sticker, { type Template } from './sticker'

const assets = loadAssets()

const DEFAULT_OPTIONS: Options = {
  size: 512,
}

export interface Options extends Record<string, unknown> {
  size: number
  template?: Template
}

export default async function render<T = unknown> (input: T, debug?: boolean): Promise<string>
/**
 * @param  input        - Content to render
 * @param [optionsInit] - Currently only color is supported
 * @param [debug]       - Debug mode
 * @returns The sticker in SVG string
 */
export default async function render<T = unknown> (input: T, optionsInit?: Partial<Options>, debug?: boolean): Promise<string>
export default async function render<T = unknown> (input: T, arg1?: boolean | Partial<Options>, arg2?: boolean): Promise<string> {
  const optionsInit: undefined | Partial<Options> = typeof arg1 === 'boolean' ? undefined : arg1
  const debug = typeof arg1 === 'boolean' ? arg1 : arg2

  const { size, template, ...params } = Object.assign({}, DEFAULT_OPTIONS, optionsInit)

  const { frame, font } = await assets

  return await satori(
    Sticker({ input, frame, template, params }, debug),
    {
      width: size,
      height: size,
      fonts: [
        { name: 'Noto Serif SC', weight: 400, style: 'normal', data: font },
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
    },
  )
}

export { Template }
