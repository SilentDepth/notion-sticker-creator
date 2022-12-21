namespace Telegram {
  type UpdateType = 'message' | 'inline_query'

  type Update<T extends UpdateType> = { update_id: number } & (
    T extends 'message' ? { message: Message } :
    T extends 'inline_query' ? { inline_query: InlineQuery } :
    never
  )

  type MessageType = 'text' | 'sticker'

  type Message<T extends MessageType> = {
    message_id: number
    from?: User
  } & (
    T extends 'text' ? { text: string, entities?: MessageEntity[] } :
    T extends 'sticker' ? { sticker: Sticker } :
    never
  )

  type User = {
    id: number
    language_code?: string
  }

  type MessageEntity = {
    type: 'mention' | 'hashtag' | 'cashtag' | 'bot_command' | 'url' | 'email' | 'phone_number' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'spoiler' | 'code' | 'pre' | 'text_link' | 'text_mention' | 'custom_emoji'
    offset: number
    length: number
  }

  type Sticker = {
    file_id: string
    file_unique_id: string
  }

  type InlineQuery = {
    id: string
    from: User
    query: string
  }
}
