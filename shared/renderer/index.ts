import satori from 'satori'

import loadAssets from './load-assets'
import Sticker from './sticker'

const assets = loadAssets()

const DEFAULT_OPTIONS: Options = {
  size: 512,
}

interface Options extends Record<string, unknown> {
  size: number
}

export default async function render (input: string, debug?: boolean): Promise<string>
/**
 * @param  input        - Content to render
 * @param [optionsInit] - Currently only color is supported
 * @param [debug]       - Debug mode
 * @returns The sticker in SVG string
 */
export default async function render (input: string, optionsInit?: Partial<Options>, debug?: boolean): Promise<string>
export default async function render (input: string, arg1?: boolean | Partial<Options>, arg2?: boolean): Promise<string> {
  const optionsInit: undefined | Partial<Options> = typeof arg1 === 'boolean' ? undefined : arg1
  const debug = typeof arg1 === 'boolean' ? arg1 : arg2

  const { size, ...params } = Object.assign({}, DEFAULT_OPTIONS, optionsInit)

  const { frame, font } = await assets

  return await satori(
    Sticker({ input, frame, params }, debug),
    {
      width: size,
      height: size,
      fonts: [
        { name: 'Noto Serif SC', weight: 400, style: 'normal', data: font },
      ],
    },
  )
}
