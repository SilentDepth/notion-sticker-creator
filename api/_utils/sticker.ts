import sharp, { type FormatEnum } from 'sharp'
import render, { type Options } from '../../shared/renderer'

export default function createSticker (input: string, options?: Partial<Options>): RenderResult {
  return _render(input, options)
}

function _render (input: string, options?: Partial<Options>): RenderResult {
  const result: Partial<RenderResult> = render(input, options)

  result.toBuffer = async function toBuffer (this: RenderResult, format) {
    const svgBuffer = Buffer.from(await this, 'ascii')
    if (format && format !== 'svg') {
      return sharp(svgBuffer).toFormat(format).toBuffer()
    } else {
      return svgBuffer
    }
  }

  return result as RenderResult
}

interface RenderResult extends Promise<string> {
  toBuffer: (format?: keyof FormatEnum) => Promise<Buffer>
}
