import { createFileRoute } from '@tanstack/react-router'
import { stickerResponse } from '@/server/sticker-response'
import createSticker from '@/shared/core'

export const Route = createFileRoute('/api/sticker/generate/calendar')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const { format, ...params } = Object.fromEntries(url.searchParams)
        const sticker = createSticker('calendar', params)

        return stickerResponse(sticker, format)
      },
    },
  },
})
