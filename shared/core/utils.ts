export const isBrowser = new Function('try { return this === window } catch { return false }')
export const IS_BROWSER = new Function('try { return this === window } catch { return false }')()

/**
 * Remove Unicode Variation Selectors from user input
 *
 * Unicode Variation Selectors (U+FE00-FE0F) are used to mark some symbols for OS
 * to be rendered as emojis. But sometimes we actually need the symbol version, not
 * the emoji. So we need to remove the mark in these cases.
 */
export function sanitize (input: string): string {
  return input.split('').filter(c => c.charCodeAt(0) < 0xFE00 || 0xFE0F < c.charCodeAt(0)).join('')
}

export function encodeBase64url (text: string): string {
  if (IS_BROWSER) {
    return text
  } else {
    return Buffer.from(text).toString('base64url')
  }
}

export function split (text: string): string[] {
  return [...new Intl.Segmenter().segment(text)].map(s => s.segment)
}

export interface SatoriNode {
  type: string
  props: Record<string, any>
}

export function h (type: string, props: Record<string, any> = {}, children?: null | string | SatoriNode | Array<null | string | SatoriNode>): SatoriNode {
  return {
    type,
    props: {
      ...props,
      style: props.style ? style`${props.style}` : null,
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
        const nameEnd = rule.indexOf(':')
        const [prop, value] = [rule.slice(0, nameEnd).trim(), rule.slice(nameEnd + 1).trim()]
        return [camelCase(prop), value]
      })
  )
}

function camelCase (str: string): string {
  return str.replaceAll(/-\w/g, match => match[1].toUpperCase())
}
