import handler from '@tanstack/react-start/server-entry'
import type { Promisable } from 'type-fest'
import type { CloudflareEnv, ServerContext } from '@/server/cloudflare'

export default {
  fetch(request: Request, env: CloudflareEnv): Promisable<Response> {
    return handler.fetch(request, {
      context: {
        cloudflare: { env },
      },
    })
  },
}

declare module '@tanstack/react-router' {
  interface Register {
    server: {
      requestContext: ServerContext
    }
  }
}
