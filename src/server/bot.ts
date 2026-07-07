import type { CacheNamespace } from './cloudflare'
import { sha256 } from './hash'
import { createStickerFromRequest, resolveInlineSticker } from './inline-sticker'
import { help, helpCalendar, helpPhrase } from './messages'
import { parseQuery } from './query'
import type { Telegram } from './utils/telegram'
import telegram from './utils/telegram'
import { createStickerRenderContext, type CloudflareAssetsBinding } from '@/shared/core/assets'
import { SupportedFormat } from '@/shared/core/utils'

export { createStickerFromRequest, resolveInlineSticker } from './inline-sticker'
export { parseQuery } from './query'

interface CacheItem {
  key: string
  data: object
  sticker_file_id: string
  created_at: string
}

export async function handleBotHook(
  request: Request,
  cache: CacheNamespace,
  assets?: CloudflareAssetsBinding,
): Promise<Response> {
  const secret = request.headers.get('x-telegram-bot-api-secret-token')
  if (process.env.NODE_ENV !== 'development' && secret !== process.env.TG_BOT_SECRET) {
    return empty()
  }

  const update = (await request.json()) as Telegram.Update
  const updateType = getUpdateType(update)

  switch (updateType) {
    case 'message':
      await handleMessage(update as Telegram.Update<'message'>)
      return empty()
    case 'inline_query':
      await handleInlineQuery(update as Telegram.Update<'inline_query'>, request.url, cache, assets)
      return empty()
    default:
      return empty()
  }
}

function getUpdateType(update: Telegram.Update): Telegram.UpdateType {
  const keys = new Set(Object.keys(update))
  keys.delete('update_id')

  if (keys.size === 1) {
    return keys.values().next().value as Telegram.UpdateType
  }

  throw new Error('More than one type of update received')
}

async function handleMessage(update: Telegram.Update<'message'>): Promise<void> {
  const { message } = update
  if (message.chat.type !== 'private') return

  if (message.from && isTextMessage(message)) {
    const { from, text } = message

    switch (text) {
      case '/start':
      case '/help':
        await telegram.sendMessage(from.id, help())
        break
      case '/help_phrase':
        await telegram.sendMessage(from.id, helpPhrase())
        break
      case '/help_calendar':
        await telegram.sendMessage(from.id, helpCalendar())
        break
    }
  }
}

function isTextMessage(message: Telegram.Message): message is Telegram.Message<'text'> {
  return 'text' in message
}

async function handleInlineQuery(
  update: Telegram.Update<'inline_query'>,
  requestUrl: string,
  cache: CacheNamespace,
  assets?: CloudflareAssetsBinding,
): Promise<void> {
  const queryId = update.inline_query.id
  const parsedQuery = parseQuery(update.inline_query.query)
  if (!parsedQuery) return

  const stickerRequest = resolveInlineSticker(parsedQuery)
  if (!stickerRequest) return

  const sticker = createStickerFromRequest(stickerRequest)
  const cacheKey = await sha256(sticker.key)
  const cached = await getCacheItem(cache, cacheKey)

  if (cached) {
    try {
      await telegram.answerInlineQuery(queryId, cacheKey, cached.sticker_file_id)
      return
    } catch {}
  }

  const stickerBuffer = await sticker
    .render(SupportedFormat.webp, undefined, createStickerRenderContext(requestUrl, assets))
    .toBuffer()
  const fileId = await telegram.sendSticker(stickerBuffer, Number(queryId))
  await Promise.all([
    telegram.answerInlineQuery(queryId, cacheKey, fileId),
    cache.put(
      cacheKey,
      JSON.stringify({
        key: cacheKey,
        data: stickerRequest,
        sticker_file_id: fileId,
        created_at: new Date().toISOString(),
      } satisfies CacheItem),
    ),
  ])
}

async function getCacheItem(cache: CacheNamespace, key: string): Promise<CacheItem | null> {
  const cached = await cache.get(key)
  return cached ? (JSON.parse(cached) as CacheItem) : null
}

function empty(): Response {
  return new Response(null, { status: 204 })
}
