interface CacheItem {
  key: string
  data: object
  sticker_file_id: string
  created_at: number
}

export async function get(key: string): Promise<CacheItem | null> {
  try {
    const response = await fetch(kvUrl(key), {
      headers: {
        Authorization: `Bearer ${requiredEnv('CF_API_TOKEN')}`,
      },
    })

    if (!response.ok) return null
    return (await response.json()) as CacheItem
  } catch {
    return null
  }
}

export async function put(key: string, value: Omit<CacheItem, 'created_at'>): Promise<void> {
  await fetch(kvUrl(key), {
    body: JSON.stringify({ ...value, created_at: Date.now() }),
    headers: {
      Authorization: `Bearer ${requiredEnv('CF_API_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  })
}

function kvUrl(key: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${requiredEnv('CF_ACCOUNT_ID')}/storage/kv/namespaces/${requiredEnv('CF_KV_NAMESPACE_ID')}/values/${key}`
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}
