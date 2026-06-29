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

interface CloudflareGlobal {
  __env__?: CloudflareEnv
}

export function installCloudflareEnv(env: CloudflareEnv): void {
  ;(globalThis as typeof globalThis & CloudflareGlobal).__env__ = env
}
