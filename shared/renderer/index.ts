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
  /** Text region padding in em. Default to 0.25em */
  padding: number
  /** Text baseline offset in em. Default to 17/238em*/
  offset: number
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

const MAX = 9

function resolveOptions (optionsInit?: Partial<OptionsInit>): OptionsResolved {
  const colors = (() => (optionsInit?.color || '').includes(',')
    ? optionsInit?.color?.split(',') ?? []
    : new Array(MAX).fill(optionsInit?.color)
  )()
  return {
    size: optionsInit?.size ?? 512,
    colors,
    params: optionsInit?.params,
  }
}

function resolveParams (graphemeCount: number, params?: Partial<Params>): Params {
  return {
    padding: 0.25,
    offset: 17 / 238,
    ...params,
  }
}

const BLANK = { value: '' }

function parse (
  graphemes: Array<{ value: string, color?: string }>,
  assets: { frame: string },
  { padding, offset }: Params,
  debug?: boolean,
): SatoriNode {
  switch (graphemes.length) {
    case 0:
      graphemes = [BLANK]
      break
    case 1:
      break
    case 2:
      graphemes.splice(1, 0, BLANK, BLANK)
      break
    case 3:
      graphemes.push(BLANK)
      break
    case 4:
      break
    case 5:
    case 6:
    case 7:
    case 8:
      graphemes.push(...new Array(MAX - graphemes.length).fill(BLANK))
      break
    case 9:
      break
    default:
      graphemes = graphemes.slice(0, MAX)
  }

  const groupSize = Math.ceil(Math.sqrt(graphemes.length))
  const groups = graphemes.reduce<any[][]>((groups, grapheme, idx) => {
    if (idx % groupSize === 0) {
      groups.unshift([])
    }
    groups[0].push(grapheme)
    return groups
  }, []).reverse()
  const fontSize = 316 / (groupSize + padding * 2)

  return h(
    'div',
    { style: style`display: flex; width: 100%; height: 100%` },
    [
      debug ? null : h('img', {
        src: assets.frame,
        width: '100%',
        height: '100%',
        style: style`position: absolute; top: 0; left: 0`,
      }),
      h(
        'div',
        { style: style`display: flex; flex-direction: column; justify-content: center; align-items: center; width: 316px; height: 316px; font-size: ${fontSize}px; line-height: 1em; ${debug ? '' : `transform: translate(128px, 151px) scaleY(0.943) skewY(-3.52deg)`}; transform-origin: top left; ${debug ? 'background-color: #fff' : ''}` },
        groups.map(group => {
          return h('div', { style: style`display: flex` }, group.map(grapheme => {
            return h('span', { style: style`display: flex; justify-content: center; width: 1em; height: 1em; color: ${grapheme.color || '#000'}; ${debug ? 'box-shadow: 0 0 0 1px #f0f' : ''}` }, h('span', { style: style`transform: translateY(${-1 * fontSize * offset}px)` }, grapheme.value))
          }))
        }),
      ),
    ],
  )
}

interface SatoriNode {
  type: string
  props: Record<string, any>
}

function h (type: string, props?: Record<string, any>, children?: null | string | SatoriNode | Array<null | string | SatoriNode>): SatoriNode {
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
      .split(/\s*;(?!base64)\s*/)
      .filter(Boolean)
      .map(rule => {
        const idx = rule.indexOf(':')
        const [prop, value] = [rule.slice(0, idx).trim(), rule.slice(idx + 1).trim()]
        return [camelCase(prop), value]
      })
  )
}

function camelCase (str: string): string {
  return str.replaceAll(/-\w/g, match => match[1].toUpperCase())
}
