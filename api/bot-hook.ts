import type { VercelApiHandler } from '@vercel/node'

import createSticker from '../shared/core'
import * as deta from './_utils/deta'
import * as telegram from './_utils/telegram'

export default <VercelApiHandler>async function (req, res) {
  const updateType = getUpdateType(req.body)
  switch (updateType) {
    case 'message':
      await handleMessage(req.body)
      break
    case 'inline_query':
      await handleInlineQuery(req.body)
      break
    default:
      console.error(`Unexpected update type (${updateType})`)
      // TODO: Notify me
  }

  res.status(204)
  res.end()
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

async function handleMessage (update: any): Promise<void> {}

async function handleInlineQuery (update: any): Promise<void> {
  const queryId = update.inline_query.id as string
  const queryText = update.inline_query.query as string

  const [$, args] = parseQuery(queryText) ?? []
  let sticker!: ReturnType<typeof createSticker>
  switch ($) {
    case undefined:
    case 'phrase': {
      if (!args) {
        return
      } else {
        const { 0: text, ...params } = args
        if (text === 'css' && Array.prototype.slice.call(args, 0, 3).join(' ') === 'css is awesome') {
          sticker = createSticker('css-is-awesome')
        } else {
          const testerMode = await telegram.isTester(update.inline_query.from.id)
          sticker = createSticker('phrase', { ...params, text, max: testerMode ? Infinity : undefined })
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

  // Check if the same sticker has been created
  const cache = await deta.getItem(sticker.key)
  if (cache) {
    await telegram.answerInlineQuery(queryId, '0', cache.sticker_file_id)
  } else {
    const stickerBuffer = await sticker.render().toBuffer('webp')
    const fileId = await telegram.sendSticker(stickerBuffer)
    await Promise.all([
      telegram.answerInlineQuery(queryId, '0', fileId),
      deta.insertItem({ key: sticker.key, sticker_file_id: fileId })
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
