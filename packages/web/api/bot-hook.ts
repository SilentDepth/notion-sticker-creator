import type { VercelApiHandler } from '@vercel/node'
import axios from 'axios'

// Config axios defaults to make life easier
axios.defaults.baseURL = `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/`
axios.interceptors.response.use(
  res => res.data.result,
  err => Promise.reject(err.response.data),
)

const DRIVE_CHAT_ID = process.env.TG_CHAT_DRIVE

export default <VercelApiHandler>async function (req, res) {
  const queryID = req.body.inline_query?.id
  const text = req.body.inline_query?.query

  if (text) {
    // First, create a webp and upload to Telegram server (by sending file to a "hidden" group)
    const message = await axios.post<any, TgMessage<'sticker'>>('sendSticker', {
      chat_id: DRIVE_CHAT_ID,
      sticker: `https://${process.env.VERCEL_URL}/api/create?text=${encodeURIComponent(text)}&format=webp`,
    })
    // Then, "forward" the uploaded webp to user as inline query result
    // This is the only way we found which is possible to send a sticker via an inline bot
    await axios.post('answerInlineQuery', {
      inline_query_id: queryID,
      results: [{
        type: 'sticker',
        id: text,
        sticker_file_id: message.sticker.file_id,
      }],
    })
    // TODO: Remove the uploaded webp to save storage for Telegram
  }

  // We don't need to send anything back to Telegram
  res.status(204).end()
}

type TgMessage<T> = {
  message_id: number
  // We don't need other properties
  // ...
} & (
  T extends 'sticker' ? { sticker: TgSticker } : {}
)

interface TgSticker {
  file_id: string
  // We don't need other properties
  // ...
}
