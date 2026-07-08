import { beforeEach, expect, test, vi } from 'vite-plus/test'
import { handleBotHook } from '@/routes/api/bot-hook'
import type { CacheNamespace } from '@/server/cloudflare'

const telegram = vi.hoisted(() => ({
  answerInlineQuery: vi.fn(),
  sendMessage: vi.fn(),
  sendSticker: vi.fn(),
  sendStickerFile: vi.fn(),
}))

const sticker = vi.hoisted(() => ({
  key: 'sticker-key',
  render: vi.fn(() => ({
    toBuffer: vi.fn(async () => new Uint8Array([1, 2, 3])),
  })),
  type: 'phrase',
}))

vi.mock('@/server/utils/telegram', () => ({
  default: telegram,
}))

vi.mock('@/server/inline-sticker', async importOriginal => {
  const original = await importOriginal<typeof import('@/server/inline-sticker')>()
  return {
    ...original,
    createStickerFromRequest: vi.fn(() => sticker),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  process.env.TG_BOT_SECRET = 'test-secret'
  telegram.sendSticker.mockResolvedValue('uploaded-file-id')
  telegram.sendStickerFile.mockResolvedValue('sent-file-id')
})

test('private text message generates and returns a sticker', async () => {
  const cache = createCache()

  await handleBotHook(createMessageRequest('天地玄黄'), cache)

  expect(sticker.render).toHaveBeenCalledOnce()
  expect(telegram.sendSticker).toHaveBeenCalledWith(expect.any(Uint8Array), 10)
  expect(telegram.sendStickerFile).toHaveBeenCalledWith(123, 'uploaded-file-id')
  expect(await cache.get('sticker-key')).toContain('"sticker_file_id":"uploaded-file-id"')
})

test('private text message reuses cached sticker file id', async () => {
  const cache = createCache({
    'sticker-key': JSON.stringify({
      key: 'sticker-key',
      data: { type: 'phrase', params: { text: '天地玄黄', max: null } },
      sticker_file_id: 'cached-file-id',
      created_at: '2026-01-01T00:00:00.000Z',
    }),
  })

  await handleBotHook(createMessageRequest('天地玄黄'), cache)

  expect(sticker.render).not.toHaveBeenCalled()
  expect(telegram.sendSticker).not.toHaveBeenCalled()
  expect(telegram.sendStickerFile).toHaveBeenCalledWith(123, 'cached-file-id')
})

function createMessageRequest(text: string): Request {
  return new Request('https://example.com/api/bot-hook', {
    method: 'POST',
    headers: { 'x-telegram-bot-api-secret-token': 'test-secret' },
    body: JSON.stringify({
      update_id: 1,
      message: {
        message_id: 10,
        from: { id: 123 },
        chat: { id: 123, type: 'private' },
        text,
      },
    }),
  })
}

function createCache(items: Record<string, string> = {}): CacheNamespace {
  const values = new Map(Object.entries(items))

  return {
    get: vi.fn(async key => values.get(key) ?? null),
    put: vi.fn(async (key, value) => {
      values.set(key, value)
    }),
  }
}
