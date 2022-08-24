import notionFrameURL from '../assets/notion-logo-frame.png'
import useFlag from '../stores/flag'

/** @type {HTMLImageElement} */
let notionFrame

async function loadFrame () {
  return notionFrame || new Promise(resolve => {
    const img = new Image()
    img.src = notionFrameURL
    img.onload = () => {
      notionFrame = img
      resolve(notionFrame)
    }
  })
}

async function loadFont (...args) {
  return document.fonts.load(...args)
}

const DEFAULT_CONFIG = {
  color: '#000',
}

const DEFAULT_CONFIG_1CH = {
  fontSize: 239,
  transform: [1, -0.065, 0, 1, 28, 56],
}

const DEFAULT_CONFIG_4CH = {
  fontSize: 124,
  transform: [1, -0.067, 0, 1, 34, 58],
  leading: 120,
}

/**
 * @param {HTMLCanvasElement}  canvas
 * @param {string}             text
 * @param {object}            [config]
 */
export async function render (canvas, text, config = {}) {
  const { width, height } = canvas
  if (width !== height || width !== 512) {
    throw new Error('The canvas must be 512x512')
  }

  const { example } = $(useFlag())

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  if (!example) {
    ctx.drawImage(await loadFrame(), 0, 0)
  }

  const _text = text.slice(0, 4)
  ctx.save()
  switch (_text.length) {
    case 1:
      await render1ch(ctx, _text, Object.assign({}, DEFAULT_CONFIG, DEFAULT_CONFIG_1CH, config))
      break
    case 2:
      await render4ch(ctx, `${_text[0]}  ${_text[1]}`, Object.assign({}, DEFAULT_CONFIG, DEFAULT_CONFIG_4CH, config))
      break
    case 3:
      await render4ch(ctx, `${_text} `, Object.assign({}, DEFAULT_CONFIG, DEFAULT_CONFIG_4CH, config))
      break
    case 4:
      await render4ch(ctx, _text, Object.assign({}, DEFAULT_CONFIG, DEFAULT_CONFIG_4CH, config))
      break
  }
  ctx.restore()
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string}                   text
 * @param {object}                   config
 */
async function render1ch (ctx, text, config) {
  const { example } = $(useFlag())
  const { color, fontSize, transform } = config

  const font = `700 ${fontSize}px Noto Serif SC`
  await loadFont(font, text)

  ctx.transform(...transform)
  ctx.fillStyle = example ? '#0cf' : color
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 256 + fontSize / 2 + calcOffset(ctx, text, fontSize))
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string}                   text
 * @param {object}                   config
 */
async function render4ch (ctx, text, config) {
  const { example } = $(useFlag())
  const { color, fontSize, leading, transform } = config

  const font = `700 ${fontSize}px Noto Serif SC`
  await loadFont(font, text)

  ctx.transform(...transform)
  ctx.fillStyle = example ? '#0cf' : color
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text.slice(0, 2), 256, 256 + calcOffset(ctx, text.slice(0, 2), fontSize))
  ctx.textBaseline = 'top'
  ctx.fillText(text.slice(2), 256, 256 + leading + calcOffset(ctx, text.slice(0, 2), fontSize))
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string}                   text
 * @param {number}                   fontSize
 */
function calcOffset (ctx, text, fontSize) {
  const { actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(text)
  const height = actualBoundingBoxAscent + actualBoundingBoxDescent
  return (height - fontSize) / 2 - actualBoundingBoxDescent
}
