export function canCreateWebpDataURL (): boolean {
  const canvas = document.createElement('canvas')
  const dataURL = canvas.toDataURL('image/webp')
  return dataURL.startsWith('data:image/webp')
}
