import {
  createStickerRenderContext,
  type CloudflareAssetsBinding,
  type StickerRenderContext,
} from '@/shared/core/assets'
import type Sticker from '@/shared/core/sticker'
import { SupportedFormat } from '@/shared/core/utils'
import profiler from '@/shared/profiler'

export async function stickerResponse(
  sticker: Sticker,
  format: string | null | undefined,
  requestUrl?: string,
  assets?: CloudflareAssetsBinding,
): Promise<Response> {
  const requestProfiler = hasPerfQuery(requestUrl) ? profiler() : undefined
  const context = {
    ...createStickerRenderContext(requestUrl, assets),
    ...(requestProfiler ? { profiler: requestProfiler } : {}),
  }
  const response = await createStickerResponse(sticker, format, context)

  if (requestProfiler) {
    requestProfiler.end('total')
    response.headers.set('Server-Timing', requestProfiler.toServerTimingHeader())
  }

  return response
}

async function createStickerResponse(
  sticker: Sticker,
  format: string | null | undefined,
  context: StickerRenderContext,
): Promise<Response> {
  const resolvedFormat = context.profiler
    ? await context.profiler.measure('format', () => normalizeFormat(format))
    : normalizeFormat(format)

  if (resolvedFormat === 'svg') {
    const svg = context.profiler
      ? await context.profiler.measure('render.svg', () => sticker.render(false, context))
      : await sticker.render(false, context)

    return new Response(svg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }

  const buffer = context.profiler
    ? await context.profiler.measure('render.image', () =>
        sticker.render(resolvedFormat, undefined, context).toBuffer(),
      )
    : await sticker.render(resolvedFormat, undefined, context).toBuffer()

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

function hasPerfQuery(requestUrl: string | undefined): boolean {
  if (!requestUrl) return false

  try {
    return new URL(requestUrl).searchParams.has('perf')
  } catch {
    return false
  }
}
