import type { VercelApiHandler } from '@vercel/node'

import profiler from '../shared/profiler'
import * as deta from './_utils/deta'
import * as telegram from './_utils/telegram'
import createSticker from './_utils/sticker'
import { sanitize } from '../shared/renderer/utils'
import weekdayColors from '../shared/renderer/weekday-colors'

export default <VercelApiHandler>async function (req, res) {
  const { start, end, result } = profiler()

  const queryId = req.body.inline_query?.id
  const input = req.body.inline_query?.query

  const { mode, ...params } = parseArg(input) ?? {}
  const task = switchTask(mode)?.(params)
  if (!task) {
    return send204()
  }

  try {
    const key = (await task.next()).value as string
    if (!key) {
      return send204()
    }

    start('deta:check-cache')
    const cache = await deta.getItem(key)
    end('deta:check-cache')

    if (cache) {
      start('telegram:answer-inline-query')
      await telegram.answerInlineQuery(queryId, '0', cache.sticker_file_id)
      end('telegram:answer-inline-query')
    } else {
      start('render-sticker')
      const buffer = (await task.next()).value as Buffer
      end('render-sticker')

      start('telegram:send-sticker')
      const fileId = await telegram.sendSticker(buffer)
      end('telegram:send-sticker')

      await Promise.all([
        (async () => {
          start('telegram:answer-inline-query')
          await telegram.answerInlineQuery(queryId, '0', fileId)
          end('telegram:answer-inline-query')
        })(),
        (async () => {
          start('deta:insert-item')
          await deta.insertItem({ key, sticker_file_id: fileId })
          end('deta:insert-item')
        })(),
      ])
    }
  } catch (err) {
    console.error(err)
  } finally {
    console.log({ profile: 'hook', query: input, ...result() })
  }

  // We don't need to send anything back to Telegram
  return send204()

  function send204 (): void {
    res.status(204).end()
  }
}

type Args = Record<string, string> & { mode: string, input?: string[] }

function parseArg (input: string): Args | null {
  const MODE_RE = /^\$(\w+)(?:\s+|$)/y
  const [, mode = 'phrase'] = MODE_RE.exec(input) ?? []
  if (!input || !['phrase', 'calendar', 'cal'].includes(mode)) {
    return null
  }

  const segments = input
    .slice(MODE_RE.lastIndex)
    .split(/((?<!\\)\s)+/)
    .filter(s => !/^\s*$/.test(s))
  const args = segments.reduce((dict, arg) => {
    const [key, value] = arg.split(/(?<=^\w+)=/)
    if (value) {
      dict[key] = value.replaceAll(/\\(.)/g, '$1')
    } else {
      dict.input ??= []
      dict.input.push(key.replaceAll(/\\(.)/g, '$1'))
    }
    return dict
  }, {} as Record<string, string> & { input?: string[] })
  // Telegram will trim every message before send to bot server. Therefore, we may
  // receive user's "A\ " as "A\" where the space is trimmed.
  // However, it should not be valid that user intended to drop a single "\" at the
  // end, since it should be escaped beforehand anyway. So we could assume that the
  // last "\" is actually an escape for a space.
  if (args.input?.[0].endsWith('\\')) {
    args.input[0] = args.input[0].slice(0, -1) + ' '
  }

  return Object.assign(args, { mode })
}

function switchTask (mode?: string) {
  switch (mode) {
    case 'phrase':
      return createPhrase
    case 'calendar':
    case 'cal':
      return createCalendar
    default:
      return null
  }
}

async function* createPhrase (params: Omit<Args, 'mode'>): AsyncGenerator {
  const text = sanitize(params.input?.[0])
  delete params.input

  // Cache key
  yield text ? ['phrase', encode(text), params.layout, params.color].filter(Boolean).join(':') : null
  // Sticker buffer
  yield await createSticker(text, params).toBuffer('webp')
}

async function* createCalendar ({ input, color, timezone = 'Asia/Shanghai', locale }: Omit<Args, 'mode'>): AsyncGenerator {
  process.env.TZ = timezone

  const date = input?.[0] ? new Date(input[0]) : new Date()
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }

  color = color === 'week' ? weekdayColors[date.getDay()] : (color || 'crimson')

  const dateStr = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
  // Cache key
  yield ['calendar', encode(dateStr), color, locale].filter(Boolean).join(':')
  // Sticker buffer
  yield await createSticker(date, { template: 'calendar', color, locale }).toBuffer('webp')
}

function encode (str: string): string {
  return Buffer.from(str).toString('base64url')
}
