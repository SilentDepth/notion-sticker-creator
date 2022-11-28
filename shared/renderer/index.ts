import satori from 'satori'

import loadAssets from './load-assets'

const assets = loadAssets()

interface OptionsInit {
  size: number
  color: string
  params: Partial<Params>
  debug: boolean
}

interface OptionsResolved {
  size: number
  colors: string[]
  params?: Partial<Params>
}

interface Params {
  fontSize: number
  lineHeight: number
  translate: [number, number]
  skewY: number
}

/**
 * @param text        - Text to render inside sticker frame
 * @param optionsInit - Currently only color is supported
 * @returns The sticker in SVG format
 */
export default async function render (text: string, optionsInit?: Partial<OptionsInit>) {
  const options = resolveOptions(optionsInit)

  // At the moment, Firefox doesn't support Intl.Segmenter yet.
  const graphemes = Intl.Segmenter ? [...new Intl.Segmenter().segment(text)] : text.split('').map(s => ({ segment: s }))
  const items = graphemes.map((it, idx) => ({
    value: it.segment,
    color: options.colors[idx],
  }))
  return await satori(
    parse(items, await assets, resolveParams(items.length, options.params), optionsInit?.debug),
    {
      width: options.size,
      height: options.size,
      fonts: [
        { name: 'Noto Serif SC', weight: 400, style: 'normal', data: (await assets).font },
      ],
    },
  )
}

function resolveOptions (optionsInit?: Partial<OptionsInit>): OptionsResolved {
  const colors = (() => (optionsInit?.color || '').includes(',')
    ? optionsInit?.color?.split(',') ?? []
    : new Array(4).fill(optionsInit?.color)
  )()
  return {
    size: optionsInit?.size ?? 512,
    colors,
    params: optionsInit?.params,
  }
}

function resolveParams (graphemeCount: number, params?: Partial<Params>): Params {
  let defaultParams: Params
  switch (graphemeCount) {
    case 0:
    case 1:
      defaultParams = { fontSize: 238, lineHeight: 100, translate: [147, 31], skewY: -0.07 }
      break
    default:
      defaultParams = { fontSize: 124, lineHeight: 100, translate: [34, 41], skewY: -0.075 }
  }
  return { ...defaultParams, ...params }
}

function parse (
  graphemes: Array<{ value: string, color?: string }>,
  assets: { frame: string },
  { fontSize, lineHeight, translate, skewY }: Params,
  debug?: boolean,
): any {
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
  return h(
    'div',
    { style: style`width: 100%; height: 100%; display: flex; justify-content: center; align-items: center` },
    [
      h('img', {
        src: assets.frame,
        width: '100%',
        height: '100%',
        style: style`position: absolute; top: 0; left: 0`,
      }),
      h(
        'div',
        { style: style`width: 2em; font-size: ${fontSize}px; line-height: ${lineHeight}px; transform: translate(${translate[0]}px, ${translate[1]}px) skewY(${Math.atan(skewY)}rad); display: flex; flex-wrap: wrap` },
        graphemes.map(grapheme => h(
          'span',
          { style: style`width: 1em; height: 1em; color: ${grapheme.color || '#000'}; display: flex; justify-content: center; box-shadow: ${debug ? '0 0 0 1px #f0f' : 'none'}` },
          grapheme.value),
        ),
      ),
    ],
  )
}

interface SatoriNode {
  type: string
  props: Record<string, any>
}

function h (type: string, props: Record<string, any>, children?: string | SatoriNode | Array<string | SatoriNode>): SatoriNode {
  return {
    type,
    props: {
      ...props,
      children,
    },
  }
}

function style (segments: TemplateStringsArray, ...interpolations: any[]): Record<string, string | number> {
  const raw = segments.slice(0, -1).map((s, idx) => [s, interpolations[idx]]).flat(1).concat(segments.at(-1)).join('')
  return Object.fromEntries(
    raw
      .split(/\s*;\s*/)
      .filter(Boolean)
      .map(rule => {
        const [prop, value] = rule.split(/\s*:\s*/)
        return [camelCase(prop), value]
      })
  )
}

function camelCase (str: string): string {
  return str.replaceAll(/-\w/g, match => match[1].toUpperCase())
}
