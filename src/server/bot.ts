import * as cache from './cache'
import { md5 } from './hash'
import { help, helpCalendar, helpPhrase } from './messages'
import * as telegram from './telegram'
import type { Telegram } from './telegram-types'
import createSticker from '@/shared/core'
import { SupportedFormat } from '@/shared/core/utils'

type QueryArgs = Record<string, string>
type ParsedQuery = [type: string | undefined, args: QueryArgs]

export async function handleBotHook(request: Request): Promise<Response> {
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
      await handleInlineQuery(update as Telegram.Update<'inline_query'>)
      return empty()
    default:
      return empty()
  }
}

export function parseQuery(text: string): ParsedQuery | null {
  if (!text) return null

  const typeRe = /^\$(\w+)(?:\s+|$)/y
  const [, type] = typeRe.exec(text) ?? []
  const input = text.slice(typeRe.lastIndex)

  if (input.startsWith('#')) {
    return input.length > 2 && /\$r?$/.test(input) ? [type, { 0: input }] : null
  }

  const segments = input.split(/((?<!\\)\s)+/).filter(segment => !/^\s*$/.test(segment))

  const args: QueryArgs = {}
  const positional: string[] = []

  for (const segment of segments) {
    const { name, value } = /^(?:(?<name>\w+)=)?(?<value>.+)$/.exec(segment)?.groups ?? {}

    if (name) {
      args[name] = value
    } else if (value) {
      positional.push(value)
    }
  }

  Object.assign(args, positional)
  return [type, args]
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
        await telegram.sendMessage(from.id, helpPhrase(await telegram.isTester(from.id)))
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

async function handleInlineQuery(update: Telegram.Update<'inline_query'>): Promise<void> {
  const queryId = update.inline_query.id
  const parsedQuery = parseQuery(update.inline_query.query)
  if (!parsedQuery) return

  const [type, args] = parsedQuery
  let sticker: ReturnType<typeof createSticker> | undefined

  switch (type) {
    case undefined:
    case 'phrase': {
      const { 0: text, ...params } = args
      if (!text) return

      switch (true) {
        case text === 'css' && Object.values(args).join(' ') === 'css is awesome':
          sticker = createSticker('css-is-awesome')
          break
        case text === 'notion' && Object.values(args).join(' ') === 'notion logo':
          sticker = createSticker('notion')
          break
        case text === 'notion' && Object.values(args).join(' ') === 'notion calendar logo':
          sticker = createSticker('notion-calendar')
          break
        default:
          sticker = createSticker('phrase', {
            ...params,
            max:
              process.env.NODE_ENV === 'development' ||
              (await telegram.isTester(update.inline_query.from.id))
                ? Infinity
                : undefined,
            text,
          })
      }
      break
    }
    case 'calendar':
    case 'cal': {
      const { 0: date, ...params } = args
      sticker = createSticker('calendar', { ...params, date })
      break
    }
    case 'qrcode':
    case 'qr': {
      const { 0: data } = args
      if (!data) return
      sticker = createSticker('qrcode', { data })
      break
    }
  }

  if (!sticker) return

  const cacheKey = md5(sticker.key)
  const cached = await cache.get(cacheKey)

  if (cached) {
    await telegram.answerInlineQuery(queryId, cacheKey, cached.sticker_file_id)
    return
  }

  const stickerBuffer = await sticker.render().toBuffer(SupportedFormat.webp)
  const fileId = await telegram.sendSticker(stickerBuffer, Number(queryId))
  await Promise.all([
    telegram.answerInlineQuery(queryId, cacheKey, fileId),
    cache
      .put(cacheKey, { key: cacheKey, data: JSON.parse(sticker.key), sticker_file_id: fileId })
      .catch(() => undefined),
  ])
}

function empty(): Response {
  return new Response(null, { status: 204 })
}
