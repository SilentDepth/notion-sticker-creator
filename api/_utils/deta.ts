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
  sticker_file_id: string
}

export async function getItem (key: string): Promise<CacheItem | null> {
  return await http.get<never, CacheItem | null>(`stickers/items/${encodeURIComponent(key)}`)
    // 404 is considered a normal response which means no cache found
    .catch(err => err.response?.status === 404 ? null : Promise.reject(err))
}

export async function insertItem (item: any): Promise<void> {
  await http.post('stickers/items', { item })
}
