export namespace Telegram {
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
