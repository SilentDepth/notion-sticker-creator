import axios from 'axios'

interface CacheItem {
  key: string
  data: object
  sticker_file_id: string
  created_at: number
}

export async function get (key: string) {
  const { data } = await axios<CacheItem>(`https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE_ID}/values/${key}`, {
    headers: {
      Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
    },
  }).catch(() => ({ data: null }))
  return data
}

export async function put (key: string, value: any) {
  await axios(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE_ID}/values/${key}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
      },
      data: JSON.stringify(value),
    },
  )
}
