/**
 * @typedef {object} RendererConfig
 * @property {HTMLImageElement | Promise<HTMLImageElement>}  notionFrame
 * @property {function}                                     [beforeRender]
 */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {RendererConfig}    config
 */
export function createRenderer (canvas, config) {
  return new Renderer(canvas, config)
}

class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {RendererConfig}    config
   */
  constructor (canvas, config) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
  }

  /**
   * @typedef {object} RenderOptions
   * @property {string}   [color]
   * @property {boolean}  [frame]
   * @property {number[]} [transform]
   * @property {number}   [leading]
   */

  /**
   * @param {string}         text
   * @param {RenderOptions} [options]
   */
  async render (text, options) {
    const { chars, font, fontSize } = Renderer.parseText(text)
    options = { ...this.resolveOptions(chars.length), ...options }

    await this.config.beforeRender?.({ chars, font, fontSize, options })

    const { width, height } = this.canvas
    this.ctx.clearRect(0, 0, width, height)

    if (options?.frame) {
      this.ctx.drawImage(await this.config.notionFrame, 0, 0)
    }

    this.ctx.save()
    this.ctx.transform(...options.transform)
    this.ctx.fillStyle = options.color
    this.ctx.font = font
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'bottom'
    switch (chars.length) {
      case 1:
        this.drawText(chars[0], width / 2, height / 2 + fontSize / 2, fontSize)
        break
      case 2:
        this.drawText(chars[0] + ' ', width / 2, height / 2 + fontSize / 2, fontSize)
        this.drawText(' ' + chars[1], width / 2, height / 2 + fontSize / 2 + options.leading, fontSize)
        break
      case 3:
        this.drawText(chars.slice(0, 2).join(''), width / 2, height / 2 + fontSize / 2, fontSize)
        this.drawText(chars[2] + ' ', width / 2, height / 2 + fontSize / 2 + options.leading, fontSize)
        break
      case 4:
        this.drawText(chars.slice(0, 2).join(''), width / 2, height / 2 + fontSize / 2, fontSize)
        this.drawText(chars.slice(2).join(''), width / 2, height / 2 + fontSize / 2 + options.leading, fontSize)
        break
    }
    this.ctx.restore()
  }

  /**
   * @param {number} charNumber
   * @private
   */
  resolveOptions (charNumber) {
    return {
      color: '#000',
      frame: true,
      transform: charNumber === 1 ? [1, -0.065, 0, 1, 28, 56] : [1, -0.067, 0, 1, 34, -4],
      leading: 120,
    }
  }

  /**
   * Draw text with offset to ensure visual parity among different browsers
   *
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} fontSize
   * @private
   */
  drawText (text, x, y, fontSize) {
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

  /**
   * @param {string} text
   */
  static parseText (text) {
    const chars = text.slice(0, 4).split('')
    const fontSize = chars.length === 1 ? 239 : 124
    return {
      chars,
      font: `700 ${fontSize}px Noto Serif SC`,
      fontSize,
    }
  }
}
