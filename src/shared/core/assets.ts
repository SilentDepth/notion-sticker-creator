import IMAGE_NOTION_CALENDAR from '@/assets/images/notion-calendar-logo.png?inline'
import IMAGE_FRAME from '@/assets/images/notion-logo-frame.png?inline'
import IMAGE_NOTION from '@/assets/images/notion-logo.png?inline'

export { IMAGE_FRAME, IMAGE_NOTION, IMAGE_NOTION_CALENDAR }

const FONT_PATH = '/assets/NotoSerifSC-Bold.otf'
let assetBaseUrl: string | undefined
let fontPromise: Promise<ArrayBuffer> | undefined

interface CloudflareAssetsBinding {
  fetch(request: Request): Promise<Response>
}

interface CloudflareRuntime {
  __env__?: {
    ASSETS?: CloudflareAssetsBinding
  }
}

export async function withAssetBaseUrl<T>(
  requestUrl: string,
  callback: () => Promise<T>,
): Promise<T> {
  const previousAssetBaseUrl = assetBaseUrl
  assetBaseUrl = new URL(requestUrl).origin

  try {
    return await callback()
  } finally {
    assetBaseUrl = previousAssetBaseUrl
  }
}

export async function loadNotoSerifScFont(): Promise<ArrayBuffer> {
  fontPromise ??= fetchAsset(FONT_PATH).then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load font: ${response.status}`)
    }

    return response.arrayBuffer()
  })

  return fontPromise
}

function fetchAsset(path: string): Promise<Response> {
  const assets = (globalThis as typeof globalThis & CloudflareRuntime).__env__?.ASSETS
  if (import.meta.env.SSR && assets) {
    return assets.fetch(new Request(new URL(path, 'https://assets.local')))
  }

  return fetch(assetUrl(path))
}

function assetUrl(path: string): string {
  if (!import.meta.env.SSR) {
    return path
  }

  if (!assetBaseUrl) {
    throw new Error('Asset base URL is not set for server-side sticker rendering')
  }

  return new URL(path, assetBaseUrl).href
}
