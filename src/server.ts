import handler from '@tanstack/react-start/server-entry'
import { installCloudflareEnv, type CloudflareEnv } from './server/cloudflare'

export default {
  fetch(request: Request, env: CloudflareEnv): Promise<Response> | Response {
    installCloudflareEnv(env)

    return handler.fetch(request, {
      context: {
        cloudflare: { env },
      },
    })
  },
}
