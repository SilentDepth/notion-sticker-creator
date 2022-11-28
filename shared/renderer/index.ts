import satori from 'satori'

import loadAssets from './load-assets'

const assets = loadAssets()

/**
 * @param text        - Text to render inside sticker frame
 * @param optionsInit - Currently only color is supported
 * @returns The sticker in SVG format
 */
export default async function render (text, optionsInit?) {
  const options = resolveOptions(optionsInit)

  // At the moment, Firefox doesn't support Intl.Segmenter yet.
  const graphemes = Intl.Segmenter ? [...new Intl.Segmenter().segment(text)] : text.split('').map(s => ({ segment: s }))
  const items = graphemes.map((it, idx) => ({
    value: it.segment,
    color: options.colors[idx],
  }))
  return await satori(
    parse(items, await assets, options.params ?? resolveParams(items.length)),
    {
      width: options.size,
      height: options.size,
      fonts: [
        { name: 'Noto Serif SC', weight: 400, style: 'normal', data: (await assets).font },
      ],
    },
  )
}

function resolveOptions (optionsInit) {
  const colors = (() => (optionsInit?.color || '').includes(',')
    ? optionsInit.color.split(',')
    : new Array(4).fill(optionsInit?.color)
  )()
  return {
    size: optionsInit?.size ?? 512,
    colors,
    params: optionsInit?.params,
  }
}

function resolveParams (graphemeCount: number) {
  switch (graphemeCount) {
    case 0:
    case 1:
      return { fontSize: 238, lineHeight: 100, translate: [147, 31], skewY: -0.07 }
    default:
      return { fontSize: 124, lineHeight: 100, translate: [34, 41], skewY: -0.075 }
  }
}

function parse (graphemes, assets, { fontSize, lineHeight, translate, skewY }) {
  const BLANK = { value: ' ' }
  switch (graphemes.length) {
    case 0:
    case 1:
    case 3:
    case 4:
      break
    case 2:
      graphemes.splice(1, 0, BLANK, BLANK)
      break
    default:
      graphemes = graphemes.slice(0, 4)
  }
  return {
    type: 'div',
    props: {
      style: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
      children: [
        {
          type: 'img',
          props: {
            src: assets.frame,
            width: '100%',
            height: '100%',
            style: { position: 'absolute', top: 0, left: 0 },
          },
        },
        {
          type: 'div',
          props: {
            style: { width: '2em', fontSize: fontSize + 'px', lineHeight: lineHeight + 'px', wordBreak: 'break-all', transform: `translate(${translate.map(n => n + 'px').join(',')}) skewY(${Math.atan(skewY)}rad)`, display: 'flex', flexWrap: 'wrap' },
            children: graphemes.map(grapheme => ({
              type: 'span',
              props: {
                style: { color: grapheme.color || '#000' },
                children: grapheme.value,
              },
            })),
          },
        },
      ],
    },
  }
}
