export function supportCanvasWebpDataURL (): boolean {
  const canvas = document.createElement('canvas')
  const dataURL = canvas.toDataURL('image/webp')
  return dataURL.startsWith('data:image/webp')
}

export function supportIntlSegmenter (): boolean {
  return typeof Intl.Segmenter === 'function'
}

export async function polyfillIntlSegmenter (): Promise<void> {
  const { createIntlSegmenterPolyfill } = await import('intl-segmenter-polyfill/dist/bundled')
  // @ts-ignore
  Intl.Segmenter = await createIntlSegmenterPolyfill()
}
