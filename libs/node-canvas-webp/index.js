/*!
 * WebP support for node-canvas
 *
 * Basically copied from https://www.github.com/node-gfx/node-canvas-webp with
 * manually-built native module for AWS Lambda (Vercel Functions).
 */

const canvasModule = require('canvas')
const webp = require('./canvaswebp.node').canvasToBufferWebp

// 1.x : 2.x
const Canvas = typeof canvasModule === 'function' ? canvasModule : canvasModule.Canvas

const oToBuffer = Canvas.prototype.toBuffer

Canvas.prototype.toBuffer = function (format, config, callback) {
  if (format === 'image/webp') {
    config = config || {}
    let quality = typeof config.quality === 'number' ? config.quality * 100 : 90
    quality = Math.min(quality, 100)
    quality = Math.max(quality, 0)
    const lossless = typeof config.lossless === 'boolean' ? config.lossless : true

    let error = null, encoded
    try {
      encoded = webp(this, quality, lossless)
    } catch (ex) {
      error = ex
    }

    if (typeof callback === 'function') {
      // pseudo-async
      process.nextTick(() => callback(error, encoded))
    } else {
      if (error) throw error
      return encoded
    }

  } else {
    return oToBuffer.call(this, format, config, callback)
  }
}
