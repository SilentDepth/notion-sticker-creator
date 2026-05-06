import type { Telegram } from './telegram-types'

interface TelegramResponse<T> {
  ok: boolean
  result: T
  description?: string
}

export async function sendMessage(chatId: number, content: string): Promise<void> {
  await telegramRequest('sendMessage', {
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: 'HTML',
      text: content,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}

export async function sendSticker(arrBuf: Uint8Array, randomSeed: number): Promise<string> {
  const driveChats = getDriveChats()
  const form = new FormData()
  const chatId = driveChats[Math.abs(randomSeed) % driveChats.length] ?? driveChats[0]

  const _arrBuf = new Uint8Array(arrBuf.byteLength)
  _arrBuf.set(arrBuf)

  form.append('chat_id', chatId)
  form.append('sticker', new Blob([_arrBuf], { type: 'image/webp' }), 'sticker.webp')

  const message = await telegramRequest<Telegram.Message<'sticker'>>('sendSticker', {
    body: form,
    method: 'POST',
  })
  return message.sticker.file_id
}

export async function answerInlineQuery(
  queryId: string,
  resultId: string,
  fileId: string,
): Promise<void> {
  await telegramRequest('answerInlineQuery', {
    body: JSON.stringify({
      cache_time: process.env.NODE_ENV === 'development' ? 0 : undefined,
      inline_query_id: queryId,
      results: [
        {
          id: resultId,
          sticker_file_id: fileId,
          type: 'sticker',
        },
      ],
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}

export async function isTester(userId: number): Promise<boolean> {
  for (const chatId of getTesterChats()) {
    try {
      await telegramRequest('getChatMember', {
        body: JSON.stringify({ chat_id: chatId, user_id: userId }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      return true
    } catch {}
  }

  return false
}

async function telegramRequest<T = unknown>(method: string, init: RequestInit): Promise<T> {
  const response = await fetch(
    `https://api.telegram.org/bot${requiredEnv('TG_BOT_TOKEN')}/${method}`,
    init,
  )
  const payload = (await response.json()) as TelegramResponse<T>

  if (!response.ok || !payload.ok) {
    throw new Error(payload.description || `Telegram request failed: ${method}`)
  }

  return payload.result
}

function getDriveChats(): string[] {
  return requiredEnv('TG_CHAT_DRIVE').split(',').filter(Boolean)
}

function getTesterChats(): number[] {
  const chats = [...(process.env.TG_CHAT_TESTER?.split(',') ?? []), ...getDriveChats()]

  return chats.map(chat => Number(chat)).filter(chat => Number.isFinite(chat))
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}
