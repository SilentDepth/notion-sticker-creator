import IMAGE_NOTION_CALENDAR from '@/assets/images/notion-calendar-logo.png?inline'
import IMAGE_FRAME from '@/assets/images/notion-logo-frame.png?inline'
import IMAGE_NOTION from '@/assets/images/notion-logo.png?inline'
import type { Profiler } from '@/shared/profiler'

export { IMAGE_FRAME, IMAGE_NOTION, IMAGE_NOTION_CALENDAR }

const FONT_PATH = '/assets/NotoSerifSC-Bold.otf'
let fontPromise: Promise<ArrayBuffer> | undefined

export interface CloudflareAssetsBinding {
  fetch(request: Request): Promise<Response>
}

export interface StickerRenderContext {
  assets?: CloudflareAssetsBinding
  assetBaseUrl?: string
  profiler?: Profiler
}

export function createStickerRenderContext(
  requestUrl?: string,
  assets?: CloudflareAssetsBinding,
): StickerRenderContext {
  return {
    ...(assets ? { assets } : {}),
    ...(requestUrl ? { assetBaseUrl: new URL(requestUrl).origin } : {}),
  }
}

export async function loadNotoSerifScFont(
  context: StickerRenderContext = {},
): Promise<ArrayBuffer> {
  fontPromise ??= measure(context, 'asset.font', async () =>
    fetchAsset(FONT_PATH, context)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load font: ${response.status}`)
        }

        return response.arrayBuffer()
      })
      .catch(error => {
        fontPromise = undefined
        throw error
      }),
  )

  return fontPromise
}

function measure<T>(
  context: StickerRenderContext,
  name: string,
  callback: () => Promise<T> | T,
): Promise<T> {
  return context.profiler ? context.profiler.measure(name, callback) : Promise.resolve(callback())
}

function fetchAsset(path: string, context: StickerRenderContext): Promise<Response> {
  if (import.meta.env.SSR && context.assets) {
    return context.assets.fetch(
      new Request(new URL(path, context.assetBaseUrl ?? 'https://assets.local')),
    )
  }

  return fetch(assetUrl(path, context))
}

function assetUrl(path: string, context: StickerRenderContext): string {
  if (!import.meta.env.SSR) {
    return path
  }

  if (!context.assetBaseUrl) {
    throw new Error('Asset base URL is not set for server-side sticker rendering')
  }

  return new URL(path, context.assetBaseUrl).href
}
