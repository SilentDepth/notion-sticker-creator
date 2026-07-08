import { createFileRoute } from '@tanstack/react-router'
import type { CacheNamespace, ServerContext } from '@/server/cloudflare'
import { createStickerFromRequest, resolveInlineSticker } from '@/server/inline-sticker'
import { help, helpCalendar, helpPhrase } from '@/server/messages'
import { parseQuery } from '@/server/query'
import { empty } from '@/server/utils/http'
import telegram, { type Telegram } from '@/server/utils/telegram'
import { type CloudflareAssetsBinding, createStickerRenderContext } from '@/shared/core/assets'
import { SupportedFormat } from '@/shared/core/utils'

export const Route = createFileRoute('/api/bot-hook')({
  server: {
    handlers: {
      POST: async ({ context, request }: { context: ServerContext; request: Request }) =>
        handleBotHook(request, context.cloudflare.env.CACHE, context.cloudflare.env.ASSETS),
    },
  },
})

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
      await handleMessage(update as Telegram.Update<'message'>, request.url, cache, assets)
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

async function handleMessage(
  update: Telegram.Update<'message'>,
  requestUrl: string,
  cache: CacheNamespace,
  assets?: CloudflareAssetsBinding,
): Promise<void> {
  const { message } = update
  if (message.chat.type !== 'private') return

  if (message.from && isTextMessage(message)) {
    const { chat, text } = message

    switch (text) {
      case '/start':
      case '/help':
        await telegram.sendMessage(chat.id, help())
        break
      case '/help_phrase':
        await telegram.sendMessage(chat.id, helpPhrase())
        break
      case '/help_calendar':
        await telegram.sendMessage(chat.id, helpCalendar())
        break
      default: {
        const sticker = await getSticker(text, {
          assets,
          cache,
          randomSeed: message.message_id,
          requestUrl,
        })
        if (sticker) await telegram.sendStickerFile(chat.id, sticker.sticker_file_id)
      }
    }
  }
}

function isTextMessage(message: Telegram.Message): message is Telegram.Message<'text'> {
  return 'text' in message
}

async function getSticker(
  input: string,
  ctx: {
    assets?: CloudflareAssetsBinding
    cache?: CacheNamespace
    randomSeed?: number
    requestUrl: string
  },
): Promise<CacheItem | undefined> {
  const parsed = parseQuery(input)
  if (!parsed) return

  const stickerReq = resolveInlineSticker(parsed)
  if (!stickerReq) return

  const sticker = createStickerFromRequest(stickerReq)
  const cached = ctx.cache && (await getCacheItem(ctx.cache, sticker.key))
  if (cached) return cached

  const stickerBuffer = await sticker
    .render(SupportedFormat.webp, undefined, createStickerRenderContext(ctx.requestUrl, ctx.assets))
    .toBuffer()
  const fileId = await telegram.sendSticker(stickerBuffer, ctx.randomSeed ?? 0)
  const cacheItem = {
    key: sticker.key,
    data: stickerReq,
    sticker_file_id: fileId,
    created_at: new Date().toISOString(),
  } satisfies CacheItem

  await ctx.cache?.put(sticker.key, JSON.stringify(cacheItem))

  return cacheItem
}

async function handleInlineQuery(
  update: Telegram.Update<'inline_query'>,
  requestUrl: string,
  cache: CacheNamespace,
  assets?: CloudflareAssetsBinding,
): Promise<void> {
  const queryId = update.inline_query.id
  const sticker = await getSticker(update.inline_query.query, {
    assets,
    cache,
    randomSeed: Number(queryId),
    requestUrl,
  })

  if (!sticker) return

  await telegram.answerInlineQuery(queryId, sticker.key, sticker.sticker_file_id)
}

async function getCacheItem(cache: CacheNamespace, key: string): Promise<CacheItem | null> {
  const cached = await cache.get(key)
  return cached ? (JSON.parse(cached) as CacheItem) : null
}
