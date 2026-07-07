export interface CacheNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

export interface AssetsBinding {
  fetch(request: Request): Promise<Response>
}

export interface CloudflareEnv {
  ASSETS: AssetsBinding
  CACHE: CacheNamespace
}

export interface ServerContext {
  cloudflare: {
    env: CloudflareEnv
  }
}
