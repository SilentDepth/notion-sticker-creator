import { createFileRoute } from '@tanstack/react-router'
import type { ServerContext } from '@/server/cloudflare'
import { stickerResponse } from '@/server/sticker-response'
import createSticker from '@/shared/core'

interface StickerHandlerArgs {
  context: ServerContext
  request: Request
}

export const Route = createFileRoute('/api/sticker/generate/calendar')({
  server: {
    handlers: {
      // @ts-ignore
      GET: async ({ context, request }: StickerHandlerArgs) => {
        const url = new URL(request.url)
        const { format, ...params } = Object.fromEntries(url.searchParams)
        const sticker = createSticker('calendar', params)

        return stickerResponse(sticker, format, request.url, context.cloudflare.env.ASSETS)
      },
    },
  },
})
