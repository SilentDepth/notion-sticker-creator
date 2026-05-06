import IMAGE_FRAME from '@/assets/images/notion-logo-frame.png?inline'
import IMAGE_NOTION from '@/assets/images/notion-logo.png?inline'

export { IMAGE_FRAME, IMAGE_NOTION }

export const IMAGE_NOTION_CALENDAR = (async () => {
  if (!import.meta.env.SSR) {
    const $img = await fetchImage('/assets/notion-calendar-logo.png')
    return imgToDataURL($img)
  }

  const encoded = readPublicAssetBase64('notion-calendar-logo.png')
  return 'data:image/png;base64,' + encoded
})()

export const FONT_NOTO_SERIF_SC = (async () => {
  if (!import.meta.env.SSR) {
    const response = await fetch('/assets/NotoSerifSC-Bold.otf')
    if (!response.ok) {
      throw new Error(`Failed to load font: ${response.status}`)
    }
    return response.arrayBuffer()
  }

  const { fs, path } = getNodeBuiltins()
  return fs.readFileSync(path.resolve(process.cwd(), 'public/assets/NotoSerifSC-Bold.otf'))
})()

function readPublicAssetBase64(filename: string): string {
  const { fs, path } = getNodeBuiltins()
  return fs.readFileSync(path.resolve(process.cwd(), 'public/assets', filename)).toString('base64')
}

function getNodeBuiltins(): {
  fs: typeof import('node:fs')
  path: typeof import('node:path')
} {
  if (!process.getBuiltinModule) {
    throw new Error('Node.js built-in module loader is not available')
  }

  return {
    fs: process.getBuiltinModule('node:fs') as typeof import('node:fs'),
    path: process.getBuiltinModule('node:path') as typeof import('node:path'),
  }
}

async function fetchImage(src: string): Promise<HTMLImageElement> {
  const $img = new Image()
  $img.src = src
  return new Promise(resolve => ($img.onload = () => resolve($img)))
}

function imgToDataURL($img: HTMLImageElement): string {
  const $canvas = document.createElement('canvas')
  $canvas.width = $img.naturalWidth
  $canvas.height = $img.naturalHeight
  const ctx = $canvas.getContext('2d')!
  ctx.drawImage($img, 0, 0)
  return $canvas.toDataURL()
}
