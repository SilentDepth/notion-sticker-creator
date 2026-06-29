import type { JsonObject, JsonValue } from 'type-fest'

export namespace Telegram {
  export interface Response<T = unknown> {
    ok: boolean
    result?: T
    description?: string
  }

  export type UpdateType = 'message' | 'inline_query'

  export type Update<T extends UpdateType = UpdateType> = {
    update_id: number
  } & (T extends 'message'
    ? { message: Message }
    : T extends 'inline_query'
      ? { inline_query: InlineQuery }
      : never)

  export type MessageType = 'text' | 'sticker'

  export type Message<T extends MessageType = MessageType> = {
    message_id: number
    from?: User
    chat: Chat
  } & (T extends 'text'
    ? { text: string; entities?: MessageEntity[] }
    : T extends 'sticker'
      ? { sticker: Sticker }
      : never)

  export interface User {
    id: number
    language_code?: string
  }

  export interface Chat {
    id: number
    type: 'private' | 'group' | 'supergroup' | 'channel'
  }

  export interface MessageEntity {
    type:
      | 'mention'
      | 'hashtag'
      | 'cashtag'
      | 'bot_command'
      | 'url'
      | 'email'
      | 'phone_number'
      | 'bold'
      | 'italic'
      | 'underline'
      | 'strikethrough'
      | 'spoiler'
      | 'code'
      | 'pre'
      | 'text_link'
      | 'text_mention'
      | 'custom_emoji'
    offset: number
    length: number
  }

  export interface Sticker {
    file_id: string
    file_unique_id: string
  }

  export interface InlineQuery {
    id: string
    from: User
    query: string
  }
}

class Telegram {
  private readonly token = process.env.TG_BOT_TOKEN
  private readonly driveChats = process.env.TG_CHAT_DRIVE.split(',').filter(Boolean)

  constructor() {
    const missing = [] as string[]
    if (!this.token) {
      missing.push('TG_BOT_TOKEN')
    }
    if (!this.driveChats) {
      missing.push('TG_CHAT_DRIVE')
    }
    if (missing.length) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`)
    }
  }

  async call<T>(method: string, payload?: JsonObject | FormData) {
    const isFormData = payload instanceof FormData
    const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: 'POST',
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
      body: payload && (isFormData ? payload : JSON.stringify(payload)),
    })

    const text = await response.text()
    let body: Telegram.Response<T> | undefined

    try {
      body = text ? (JSON.parse(text) as Telegram.Response<T>) : undefined
    } catch {}

    if (!response.ok || !body?.ok) {
      const description = body?.description || text || response.statusText
      throw new Error(`Telegram API ${method} failed: ${description}`)
    }

    return body.result as T
  }

  async sendMessage(chat_id: number, text: string) {
    await this.call('sendMessage', {
      chat_id,
      parse_mode: 'HTML',
      text,
    })
  }

  async sendSticker(stickerData: Uint8Array, randomSeed: number): Promise<string> {
    const form = new FormData()
    form.append(
      'chat_id',
      this.driveChats[Math.abs(randomSeed) % this.driveChats.length] ?? this.driveChats[0],
    )
    const sticker = new Uint8Array(stickerData.byteLength)
    sticker.set(stickerData)
    form.append('sticker', new Blob([sticker], { type: 'image/webp' }), 'sticker.webp')

    const message = await this.call<Telegram.Message<'sticker'>>('sendSticker', form)
    return message.sticker.file_id
  }

  async answerInlineQuery(inline_query_id: string, resultId: string, sticker_file_id: string) {
    await this.call('answerInlineQuery', {
      inline_query_id,
      results: [{ id: resultId, sticker_file_id, type: 'sticker' }],
      cache_time: import.meta.env.DEV ? 0 : (undefined as unknown as JsonValue),
    })
  }
}

export default new Telegram()
