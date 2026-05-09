import { defineConfig } from 'nitro'

export default defineConfig({
  compatibilityDate: '2026-05-01',
  preset: 'cloudflare_module',
  wasm: false,
  storage: {
    cache: {
      driver: 'cloudflare-kv-binding',
      binding: 'CACHE',
    },
  },
  devStorage: {
    cache: {
      driver: 'cloudflare-kv-http',
      accountId: process.env.CF_ACCOUNT_ID,
      namespaceId: process.env.CF_KV_NAMESPACE_ID,
      apiToken: process.env.CF_API_TOKEN,
    },
  },
  cloudflare: {
    wrangler: {
      keep_vars: true,
      observability: {
        enabled: true,
      },
    },
  },
})
