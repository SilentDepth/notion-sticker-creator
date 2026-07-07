import handler from '@tanstack/react-start/server-entry'
import type { CloudflareEnv } from './server/cloudflare'

export default {
  fetch(request: Request, env: CloudflareEnv): Promise<Response> | Response {
    return handler.fetch(request, {
      context: {
        cloudflare: { env },
      },
    })
  },
}
