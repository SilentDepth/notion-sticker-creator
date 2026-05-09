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
      kv_namespaces: [
        {
          binding: 'CACHE',
          id: '7f44a9a7dc2b4411a8850e54e0d0406c',
        },
      ],
      observability: {
        enabled: true,
      },
    },
  },
})
