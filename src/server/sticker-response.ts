import {
  createStickerRenderContext,
  type CloudflareAssetsBinding,
  type StickerRenderContext,
} from '@/shared/core/assets'
import type Sticker from '@/shared/core/sticker'
import { SupportedFormat } from '@/shared/core/utils'

export async function stickerResponse(
  sticker: Sticker,
  format: string | null | undefined,
  requestUrl?: string,
  assets?: CloudflareAssetsBinding,
): Promise<Response> {
  return createStickerResponse(sticker, format, createStickerRenderContext(requestUrl, assets))
}

async function createStickerResponse(
  sticker: Sticker,
  format: string | null | undefined,
  context: StickerRenderContext,
): Promise<Response> {
  const resolvedFormat = normalizeFormat(format)

  if (resolvedFormat === 'svg') {
    return new Response(await sticker.render(false, context), {
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }

  const buffer = await sticker.render(resolvedFormat, undefined, context).toBuffer()
  return new Response(new Uint8Array(buffer), {
    headers: { 'Content-Type': resolveMime(resolvedFormat) },
  })
}

export function normalizeFormat(format: string | null | undefined): SupportedFormat {
  switch (format) {
    case SupportedFormat.svg:
    case SupportedFormat.png:
    case SupportedFormat.webp:
      return format
    default:
      return SupportedFormat.webp
  }
}

function resolveMime(format: SupportedFormat): string {
  switch (format) {
    default:
      return `image/${format}`
  }
}
