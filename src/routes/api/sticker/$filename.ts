import { createFileRoute } from '@tanstack/react-router'
import type { ServerContext } from '@/server/cloudflare'
import { stickerResponse } from '@/server/sticker-response'
import createSticker from '@/shared/core'

interface StickerHandlerArgs {
  context: ServerContext
  params: { filename: string }
  request: Request
}

export const Route = createFileRoute('/api/sticker/$filename')({
  server: {
    handlers: {
      // @ts-ignore
      GET: async ({ context, params, request }: StickerHandlerArgs) => {
        const { text, format } = parseFilename(params.filename)
        if (!text) return new Response(null, { status: 204 })

        const url = new URL(request.url)
        const sticker = createSticker('phrase', {
          color: url.searchParams.get('color') ?? undefined,
          text,
        })

        return stickerResponse(sticker, format, request.url, context.cloudflare.env.ASSETS)
      },
    },
  },
})

function parseFilename(filename: string): { text: string; format: string } {
  const lastDot = filename.lastIndexOf('.')

  if (lastDot === -1) {
    return { format: 'webp', text: filename }
  }

  return {
    format: filename.slice(lastDot + 1),
    text: filename.slice(0, lastDot),
  }
}
