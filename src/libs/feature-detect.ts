export function supportCanvasWebpDataURL(): boolean {
  const canvas = document.createElement('canvas')
  const dataURL = canvas.toDataURL('image/webp')
  return dataURL.startsWith('data:image/webp')
}

export function splitGraphemes(text: string): string[] {
  if (typeof Intl.Segmenter !== 'function') {
    return Array.from(text)
  }

  return [...new Intl.Segmenter().segment(text)].map(s => s.segment)
}
