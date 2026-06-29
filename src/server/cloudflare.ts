export interface CacheNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

export interface CloudflareEnv {
  CACHE: CacheNamespace
}

export interface ServerContext {
  cloudflare: {
    env: CloudflareEnv
  }
}
