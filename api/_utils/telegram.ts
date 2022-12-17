import axios from 'axios'
import FormData from 'form-data'

const DRIVE_CHATS = process.env.TG_CHAT_DRIVE!.split(',')
const TESTER_CHATS = (process.env.TG_CHAT_TESTER?.split(',') ?? []).map(s => Number(s))

const http = axios.create({
  baseURL: `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/`,
})
http.interceptors.response.use(
  res => res.data.result,
  err => Promise.reject(err.response.data),
)

/**
 * @param buffer     - Sticker buffer
 * @param randomSeed - The seed to decide which drive chat to use
 * @returns Sticker file ID returned by Telegram
 */
export async function sendSticker (buffer: Buffer, randomSeed: number): Promise<string> {
  const form = new FormData()
  form.append('chat_id', DRIVE_CHATS[randomSeed % DRIVE_CHATS.length])
  form.append('sticker', buffer, 'sticker.webp')

  const message = await http.postForm<never, TgMessage<'sticker'>>('sendSticker', form)
  return message.sticker.file_id
}

export async function answerInlineQuery (queryId: number, resultId: string, fileId: string) {
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
