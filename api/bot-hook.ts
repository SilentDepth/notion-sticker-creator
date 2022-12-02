import type { VercelApiHandler } from '@vercel/node'
import sharp from 'sharp'

import profiler from '../shared/profiler'
import render from '../shared/renderer'
import * as deta from './_utils/deta'
import * as telegram from './_utils/telegram'
import createSticker from './_utils/sticker'

function parseInput (input: string): { text?: string, color?: string } {
  const isComplexText = input.startsWith('"')
  const textEnd = isComplexText ? (input.match(/(?<!^|\\)"/)?.index ?? -1) + 1 : input.indexOf(' ')
  const text = isComplexText ? input.slice(1, textEnd - 1) : input.slice(0, textEnd < 0 ? undefined : textEnd)
  return text
    ? {
      text: text.replaceAll('\\\\', '\\').replaceAll('\\"', '"'),
      color: textEnd < 0 ? undefined : input.slice(textEnd).trim(),
    }
    : {}
}

export default <VercelApiHandler>async function (req, res) {
  const { start, end, result } = profiler()

  const queryID = req.body.inline_query?.id
  const input = req.body.inline_query?.query

  if (input.startsWith(':')) {
    switch (input.slice(1)) {
      case 'calendar': {
        const sticker = await createSticker('', { template: 'calendar' }).toBuffer('webp')
        const fileId = await telegram.sendSticker(sticker)
        await telegram.answerInlineQuery(queryID, queryID, fileId)
        return
      }
      default:
        res.status(204)
        return res.end()
    }
  }

  const { text, color } = parseInput(input)

  if (text) {
    let stickerFileID: string

    // Check if an identical sticker has been generated before
    start('check-cache')
    const cached = await deta.getItem(`${text} ${color}`)
    end('check-cache')

    if (cached) {
      stickerFileID = cached.sticker_file_id
    } else {
      start('render-sticker')
      const svg = await render(text, { color: color ?? '' })
      end('render-sticker')
      start('sharp')
      const buffer = await sharp(Buffer.from(svg, 'ascii')).toFormat('webp').toBuffer()
      end('sharp')
      // First, create a webp and upload to Telegram server (by sending file to a "hidden" group)
      start('send-sticker')
      stickerFileID = await telegram.sendSticker(buffer)
      end('send-sticker')
    }

    await Promise.all([
      // Then, "forward" the uploaded webp to user as inline query result
      // This is the only way we found which is possible to send a sticker via an inline bot
      (async () => {
        start('answer-inline-query')
        await telegram.answerInlineQuery(queryID, text, stickerFileID)
        end('answer-inline-query')
      })(),
      // If no cache found, insert one into cache database
      (async () => {
        if (cached) return
        start('insert-cache')
        await deta.insertItem({ key: `${text} ${color}`, sticker_file_id: stickerFileID })
        end('insert-cache')
      })(),
    ])

    console.log({ profile: 'hook', query: req.body.inline_query?.query, ...result() })
  }

  // We don't need to send anything back to Telegram
  res.status(204).end()
}
