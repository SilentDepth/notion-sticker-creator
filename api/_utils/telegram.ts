import axios from 'axios'
import FormData from 'form-data'

const DRIVE_CHAT_ID = process.env.TG_CHAT_DRIVE!
const TESTER_CHATS = (process.env.TG_CHAT_TESTER?.split(',') ?? []).concat(DRIVE_CHAT_ID).map(s => Number(s))

const http = axios.create({
  baseURL: `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/`,
})
http.interceptors.response.use(
  res => res.data.result,
  err => Promise.reject(err.response.data),
)

/**
 * @param buffer - Sticker buffer
 * @returns Sticker file ID returned by Telegram
 */
export async function sendSticker (buffer: Buffer): Promise<string> {
  const form = new FormData()
  form.append('chat_id', DRIVE_CHAT_ID)
  form.append('sticker', buffer, 'sticker.webp')

  const message = await http.postForm<never, TgMessage<'sticker'>>('sendSticker', form)
  return message.sticker.file_id
}

export async function answerInlineQuery (queryId: string, resultId: string, fileId: string) {
  await http.post('answerInlineQuery', {
    inline_query_id: queryId,
    results: [{
      type: 'sticker',
      id: resultId,
      sticker_file_id: fileId,
    }],
    cache_time: process.env.NODE_ENV === 'development' ? 0 : undefined,
  })
}

export async function isTester (userId: number): Promise<boolean> {
  for (const chatId of TESTER_CHATS) {
    try {
      await http.post('getChatMember', { chat_id: chatId, user_id: userId })
      return true
    } catch {}
  }
  return false
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
