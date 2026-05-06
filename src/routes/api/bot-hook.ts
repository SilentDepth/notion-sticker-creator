import { createFileRoute } from '@tanstack/react-router'
import { handleBotHook } from '@/server/bot'

export const Route = createFileRoute('/api/bot-hook')({
  server: {
    handlers: {
      POST: async ({ request }) => handleBotHook(request),
    },
  },
})
