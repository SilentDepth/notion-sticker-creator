import { createFileRoute } from '@tanstack/react-router'
import type { ServerContext } from '@/server/cloudflare'
import { stickerResponse } from '@/server/sticker-response'
import createSticker from '@/shared/core'

interface StickerHandlerArgs {
  context: ServerContext
  request: Request
}

export const Route = createFileRoute('/api/sticker/generate/qrcode')({
  server: {
    handlers: {
      // @ts-ignore
      GET: async ({ context, request }: StickerHandlerArgs) => {
        const url = new URL(request.url)
        const { data, format } = Object.fromEntries(url.searchParams)
        if (!data) return new Response(null, { status: 204 })

        const sticker = createSticker('qrcode', { data })
        return stickerResponse(sticker, format, request.url, context.cloudflare.env.ASSETS)
      },
    },
  },
})
