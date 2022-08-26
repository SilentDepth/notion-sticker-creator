import type { Canvas, Image } from 'canvas'

interface RendererConfig {
  notionFrame: HTMLImageElement | Image | Promise<HTMLImageElement | Image>
  beforeRender?: (data: ParseResult & { options: RenderOptions }) => unknown
}

interface RenderOptions {
  color: string
  frame: boolean
  transform: [number, number, number, number, number, number]
  leading: number
}

interface ParseResult {
  chars: string[]
  font: string
  fontSize: number
}

export function createRenderer (canvas: HTMLCanvasElement | Canvas, config: RendererConfig) {
  return new Renderer(canvas, config)
}

class Renderer {
  ctx: CanvasRenderingContext2D

  constructor (public canvas: HTMLCanvasElement | Canvas, public config: RendererConfig) {
    this.ctx = canvas.getContext('2d')!
  }

  async render (text: string, options?: Partial<RenderOptions>) {
    const { chars, font, fontSize } = Renderer.parseText(text)
    const optionsResolved = this.resolveOptions(chars.length, options)

    await this.config.beforeRender?.({ chars, font, fontSize, options: optionsResolved })

    const { width, height } = this.canvas
    this.ctx.clearRect(0, 0, width, height)

    if (optionsResolved.frame) {
      this.ctx.drawImage(await this.config.notionFrame, 0, 0)
    }

    this.ctx.save()
    this.ctx.transform(...optionsResolved.transform)
    this.ctx.fillStyle = optionsResolved.color
    this.ctx.font = font
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'bottom'
    switch (chars.length) {
      case 1:
        this.drawText(chars[0], width / 2, height / 2 + fontSize / 2, fontSize)
        break
      case 2:
        this.drawText(chars[0] + ' ', width / 2, height / 2 + fontSize / 2, fontSize)
        this.drawText(' ' + chars[1], width / 2, height / 2 + fontSize / 2 + optionsResolved.leading, fontSize)
        break
      case 3:
        this.drawText(chars.slice(0, 2).join(''), width / 2, height / 2 + fontSize / 2, fontSize)
        this.drawText(chars[2] + ' ', width / 2, height / 2 + fontSize / 2 + optionsResolved.leading, fontSize)
        break
      case 4:
        this.drawText(chars.slice(0, 2).join(''), width / 2, height / 2 + fontSize / 2, fontSize)
        this.drawText(chars.slice(2).join(''), width / 2, height / 2 + fontSize / 2 + optionsResolved.leading, fontSize)
        break
    }
    this.ctx.restore()
  }

  private resolveOptions (charNumber: number, options?: Partial<RenderOptions>): RenderOptions {
    return {
      color: '#000',
      frame: true,
      transform: charNumber === 1 ? [1, -0.065, 0, 1, 28, 56] : [1, -0.067, 0, 1, 34, -4],
      leading: 120,
      ...options,
    }
  }

  /**
   * Draw text with offset to ensure visual parity among different browsers
   */
  private drawText (text: string, x: number, y: number, fontSize: number) {
    // Browsers seem to have different default line heights in text rendering. As a result,
    // text are rendered at different vertical positions (horizontal positions are ok).
    // Fortunately, bounding boxes are all calculated in the same way and only Chinese
    // characters should be considered. So we just need to figure out how many pixels from
    // the bottom the text actually needs to be at center of the em square.
    const { actualBoundingBoxAscent, actualBoundingBoxDescent } = this.ctx.measureText(text)
    const actualHeight = actualBoundingBoxAscent + actualBoundingBoxDescent
    const offset = (actualHeight - fontSize) / 2 - actualBoundingBoxDescent
    this.ctx.fillText(text, x, y + offset)
  }

  static parseText (text: string) {
    const chars = text.slice(0, 4).split('')
    const fontSize = chars.length === 1 ? 239 : 124
    return {
      chars,
      font: `700 ${fontSize}px Noto Serif SC`,
      fontSize,
    }
  }
}

export type {
  Renderer
}
