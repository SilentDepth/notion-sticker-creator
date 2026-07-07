import { expect, test, vi } from 'vite-plus/test'

test('rejects sticker rendering when font loading fails', async () => {
  vi.resetModules()
  const { renderStickerNode } = await import('@/shared/core/sticker')
  const { SupportedFormat } = await import('@/shared/core/utils')

  const result = renderStickerNode(() => '1', SupportedFormat.svg, false, {
    assets: {
      fetch: async () => new Response(null, { status: 403 }),
    },
    assetBaseUrl: 'https://example.com',
  })

  await expect(
    Promise.race([
      result,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('render stayed pending')), 1_000)
      }),
    ]),
  ).rejects.toThrow('Failed to load font: 403')
})
