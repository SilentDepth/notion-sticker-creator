import { expect, test, vi } from 'vite-plus/test'
import { createStickerRenderContext } from '@/shared/core/assets'

test('creates sticker render context from request URL', () => {
  const assets = { fetch: async () => new Response() }

  expect(createStickerRenderContext('https://example.com/api/sticker/a.webp?x=1')).toEqual({
    assetBaseUrl: 'https://example.com',
  })
  expect(createStickerRenderContext('https://example.com/api/sticker/a.webp?x=1', assets)).toEqual({
    assets,
    assetBaseUrl: 'https://example.com',
  })
  expect(createStickerRenderContext()).toEqual({})
})

test('loads font through the assets binding with the request origin', async () => {
  vi.resetModules()
  const { loadNotoSerifScFont } = await import('@/shared/core/assets')
  let requestedUrl: string | undefined
  const fontData = new Uint8Array([1, 2, 3])

  const assets = {
    fetch: async (request: Request) => {
      requestedUrl = request.url
      return new Response(fontData)
    },
  }

  await expect(
    loadNotoSerifScFont({
      assets,
      assetBaseUrl: 'https://example.com',
    }),
  ).resolves.toEqual(fontData.buffer)
  expect(requestedUrl).toBe('https://example.com/assets/NotoSerifSC-Bold.otf')
})
