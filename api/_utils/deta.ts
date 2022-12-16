import axios from 'axios'

const http = axios.create({
  baseURL: `https://database.deta.sh/v1/${process.env.DETA_PROJECT_ID}/`,
  headers: {
    'x-api-key': process.env.DETA_PROJECT_KEY!,
  },
})
http.interceptors.response.use(res => res.data)

interface CacheItem {
  key: string
  data: object
  sticker_file_id: string
  created_at: number
}

export async function getItem (key: string): Promise<CacheItem | null> {
  return await http.get<never, CacheItem | null>(`stickers/items/${encodeURIComponent(key)}`)
    // 404 is considered a normal response which means no cache found
    .catch(err => err.response?.status === 404 ? null : Promise.reject(err))
}

export async function putItem (item: Omit<CacheItem, 'created_at'>): Promise<void> {
  await http.put('stickers/items', { items: [{ ...item, created_at: Date.now() }] })
}
