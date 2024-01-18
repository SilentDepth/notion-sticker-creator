import type { VercelApiHandler } from '@vercel/node'

import createSticker from '../shared/core/index.js'
import * as messages from './_bot/messages.js'
import * as deta from './_utils/deta.js'
import * as telegram from './_utils/telegram.js'
import { md5 } from './_utils/hash.js'

export default <VercelApiHandler>async function (req, res) {
  const secret = req.headers['x-telegram-bot-api-secret-token']
    if (process.env.NODE_ENV !== 'development' && secret !== process.env.TG_BOT_SECRET) return end()

  const updateType = getUpdateType(req.body)
  switch (updateType) {
    case 'message':
      await handleMessage(req.body)
      return end()
    case 'inline_query':
      await handleInlineQuery(req.body)
      return end()
    default:
      console.error(`Unexpected update type (${updateType})`)
      // TODO: Notify me
      return end()
  }

  function end () {
    res.status(204)
    res.end()
  }
}

function getUpdateType (update: object): string {
  const keys = new Set(Object.keys(update))
  keys.delete('update_id')
  if (keys.size === 1) {
    return keys.values().next().value
  }
  // This should never happen
  else {
    throw new Error('More than one type of update received')
    // TODO: Notify me
  }
}

async function handleMessage (update: Telegram.Update<'message'>): Promise<void> {
  const { message } = update
  if (message.chat.type !== 'private') return

  if (message.from && isTextMessage(message)) {
    const { from, text } = message
    switch (text) {
      case '/start':
      case '/help':
        await telegram.sendMessage(from.id, messages.help())
        break
      case '/help_phrase':
        await telegram.sendMessage(from.id, messages.help_phrase(await telegram.isTester(from.id)))
        break
      case '/help_calendar':
        await telegram.sendMessage(from.id, messages.help_calendar())
        break
    }
  }
}

function isTextMessage (message: Telegram.Message<any>): message is Telegram.Message<'text'> {
  return 'text' in message
}

async function handleInlineQuery (update: Telegram.Update<'inline_query'>): Promise<void> {
  const queryId = update.inline_query.id
  const queryText = update.inline_query.query

  const [$, args] = parseQuery(queryText) ?? []
    let sticker!: ReturnType<typeof createSticker>
  switch ($) {
    case undefined:
    case 'phrase': {
      if (!args) {
        return
      } else {
        const { 0: text, ...params } = args
        switch (true) {
          case text === 'css' && Array.prototype.join.call(args, ' ') === 'css is awesome':
            sticker = createSticker('css-is-awesome')
            break
          case text === 'notion' && Array.prototype.join.call(args, ' ') === 'notion logo':
            sticker = createSticker('notion')
            break
          case text === 'notion' && Array.prototype.join.call(args, ' ') === 'notion calendar logo':
            sticker = createSticker('notion-calendar')
            break
          default:
            sticker = createSticker('phrase', {
              ...params,
              text,
              max: (process.env.NODE_ENV === 'development' ? true : await telegram.isTester(update.inline_query.from.id)) ? Infinity : undefined,
            })
        }
      }
      break
    }
    case 'calendar':
    case 'cal': {
      const { 0: date = undefined, ...params } = typeof args === 'object' ? args : {}
      sticker = createSticker('calendar', { ...params, date })
      break
    }
    default:
      return
  }

  // Check if the same sticker was created already
  const cacheKey = md5(sticker.key)
  const cache = await deta.getItem(cacheKey).catch(() => null)
  if (cache) {
    await telegram.answerInlineQuery(queryId, cacheKey, cache.sticker_file_id)
  } else {
    const stickerBuffer = await sticker.render().toBuffer('webp')
    const fileId = await telegram.sendSticker(stickerBuffer, Number(queryId))
    await Promise.all([
      telegram.answerInlineQuery(queryId, cacheKey, fileId),
      deta.putItem({ key: cacheKey, data: JSON.parse(sticker.key), sticker_file_id: fileId }).catch(() => {})
    ])
  }
}

export function parseQuery (text: string): [string, Record<string, string>] | null {
  if (!text) return null

  const TYPE_RE = /^\$(\w+)(?:\s+|$)/y
  const [, $] = TYPE_RE.exec(text) ?? []

  const input = text.slice(TYPE_RE.lastIndex)
  if (input.startsWith('#')) {
    return input.length > 2 && /\$r?$/.test(input) ? [$, { 0: input }] : null
  } else {
    const segments = input
      .split(/((?<!\\)\s)+/)
      .filter(s => !/^\s*$/.test(s))
    const args = {} as Record<string, string>
    const _args = [] as string[]
    for (const s of segments) {
      const { name, value } = /^(?:(?<name>\w+)=)?(?<value>.+)$/.exec(s)?.groups ?? {}
      if (name) {
        args[name] = value
      } else {
        _args.push(value)
      }
    }
    Object.assign(args, _args, { length: _args.length })
    return [$, args]
  }
}
