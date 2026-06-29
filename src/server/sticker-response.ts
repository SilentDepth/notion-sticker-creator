import { withAssetBaseUrl } from '@/shared/core/assets'
import type Sticker from '@/shared/core/sticker'
import { SupportedFormat } from '@/shared/core/utils'

export async function stickerResponse(
  sticker: Sticker,
  format: string | null | undefined,
  requestUrl?: string,
): Promise<Response> {
  const createResponse = () => createStickerResponse(sticker, format)
  return requestUrl ? withAssetBaseUrl(requestUrl, createResponse) : createResponse()
}

async function createStickerResponse(
  sticker: Sticker,
  format: string | null | undefined,
): Promise<Response> {
  const resolvedFormat = normalizeFormat(format)

  if (resolvedFormat === 'svg') {
    return new Response(await sticker.render(), {
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }

  const buffer = await sticker.render(resolvedFormat).toBuffer()
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
