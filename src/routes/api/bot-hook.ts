import { createFileRoute } from '@tanstack/react-router'
import { handleBotHook } from '@/server/bot'
import type { ServerContext } from '@/server/cloudflare'

interface BotHookHandlerArgs {
  context: ServerContext
  request: Request
}

export const Route = createFileRoute('/api/bot-hook')({
  server: {
    handlers: {
      // @ts-ignore
      POST: async ({ context, request }: BotHookHandlerArgs) =>
        handleBotHook(request, context.cloudflare.env.CACHE),
    },
  },
})
