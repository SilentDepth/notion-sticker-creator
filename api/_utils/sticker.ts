import sharp, { type FormatEnum } from 'sharp'
import render, { type Options } from '../../shared/renderer'

export default function createSticker (input: unknown, options?: Partial<Options>): RenderResult {
  return new RenderResult(resolve => {
    resolve(render(input, options))
  })
}

class RenderResult extends Promise<string> {
  async toBuffer (format: keyof FormatEnum = 'svg'): Promise<Buffer> {
    const svgBuffer = Buffer.from(await this, 'ascii')
    if (format === 'svg') {
      return svgBuffer
    } else {
      return sharp(svgBuffer).toFormat(format).toBuffer()
    }
  }
}
