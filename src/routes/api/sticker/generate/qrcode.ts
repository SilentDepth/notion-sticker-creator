import { createFileRoute } from '@tanstack/react-router'
import { stickerResponse } from '@/server/sticker-response'
import createSticker from '@/shared/core'

export const Route = createFileRoute('/api/sticker/generate/qrcode')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const { data, format } = Object.fromEntries(url.searchParams)
        if (!data) return new Response(null, { status: 204 })

        const sticker = createSticker('qrcode', { data })
        return stickerResponse(sticker, format, request.url)
      },
    },
  },
})
