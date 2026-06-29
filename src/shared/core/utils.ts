export const IS_BROWSER = !import.meta.env.SSR
export const isBrowser = () => IS_BROWSER

export const enum SupportedFormat {
  svg = 'svg',
  png = 'png',
  webp = 'webp',
}

/**
 * Remove Unicode Variation Selectors from user input
 *
 * Unicode Variation Selectors (U+FE00-FE0F) are used to mark some symbols for OS
 * to be rendered as emojis. But sometimes we actually need the symbol version, not
 * the emoji. So we need to remove the mark in these cases.
 */
export function sanitize(input: string): string {
  return input
    .split('')
    .filter(c => c.charCodeAt(0) < 0xfe00 || 0xfe0f < c.charCodeAt(0))
    .join('')
}

export function split(text: string): string[] {
  if (typeof Intl.Segmenter !== 'function') {
    return Array.from(text)
  }
  return [...new Intl.Segmenter().segment(text)].map(s => s.segment)
}
