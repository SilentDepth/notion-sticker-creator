import { expect, test, vi } from 'vite-plus/test'
import { stickerResponse } from '@/server/sticker-response'
import type Sticker from '@/shared/core/sticker'

test('stickerResponse omits Server-Timing by default', async () => {
  const response = await stickerResponse(createSvgSticker(), 'svg', 'https://example.com/a.svg')

  expect(response.headers.get('Server-Timing')).toBeNull()
})

test('stickerResponse adds Server-Timing when perf query is present', async () => {
  const response = await stickerResponse(
    createSvgSticker(),
    'svg',
    'https://example.com/a.svg?perf',
  )

  expect(response.headers.get('Server-Timing')).toContain('format;dur=')
  expect(response.headers.get('Server-Timing')).toContain('render.svg;dur=')
  expect(response.headers.get('Server-Timing')).toContain('total;dur=')
})

function createSvgSticker(): Sticker {
  return {
    key: 'test',
    render: vi.fn(async () => '<svg />'),
    renderNode: vi.fn(),
    type: 'test',
  } as unknown as Sticker
}
