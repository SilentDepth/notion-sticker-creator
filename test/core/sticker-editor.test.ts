import { expect, test, vi } from 'vite-plus/test'
import {
  createStickerDownloadHref,
  formatBotCommand,
  writeStickerPngToClipboard,
} from '@/features/sticker-editor'

test('formats bot command without default color', () => {
  expect(
    formatBotCommand({
      colors: ['#000000'],
      effectiveColors: ['#000000'],
      multiColor: false,
      text: '你好',
    }),
  ).toBe('@NotionStickerBot 你好')
})

test('formats bot command with escaped text and single color', () => {
  expect(
    formatBotCommand({
      colors: ['#66ccff'],
      effectiveColors: ['#66ccff'],
      multiColor: false,
      text: String.raw`a b=c\d`,
    }),
  ).toBe(String.raw`@NotionStickerBot a\ b\=c\\d color=#66ccff`)
})

test('formats bot command with sparse multicolor values', () => {
  expect(
    formatBotCommand({
      colors: ['#000000'],
      effectiveColors: ['#66ccff', '#000000', 'goldenrod'],
      multiColor: true,
      text: '天地玄',
    }),
  ).toBe('@NotionStickerBot 天地玄 color=#66ccff,,goldenrod')
})

test('uses API fallback for WebP download when canvas WebP is unavailable', async () => {
  const renderCanvas = vi.fn(async () => {
    throw new Error('canvas should not render for fallback')
  })

  await expect(
    createStickerDownloadHref({
      format: 'webp',
      renderCanvas,
      stickerColor: '#66ccff,#000000',
      supportsWebp: () => false,
      svg: {} as SVGSVGElement,
      text: '你好 世界',
    }),
  ).resolves.toBe(
    '/api/sticker/%E4%BD%A0%E5%A5%BD%20%E4%B8%96%E7%95%8C.webp?color=%2366ccff%2C%23000000',
  )
  expect(renderCanvas).not.toHaveBeenCalled()
})

test('renders a canvas data URL for supported sticker downloads', async () => {
  const svg = {} as SVGSVGElement
  const canvas = {
    toDataURL: (type: string) => `data:${type};base64,sticker`,
  } as HTMLCanvasElement
  const renderCanvas = vi.fn(async (nextSvg: SVGSVGElement) => {
    expect(nextSvg).toBe(svg)
    return canvas
  })

  await expect(
    createStickerDownloadHref({
      format: 'webp',
      renderCanvas,
      stickerColor: '#66ccff',
      supportsWebp: () => true,
      svg,
      text: '你好',
    }),
  ).resolves.toBe('data:image/webp;base64,sticker')
  expect(renderCanvas).toHaveBeenCalledTimes(1)
})

test('copies sticker PNG through injected clipboard writer', async () => {
  const svg = {} as SVGSVGElement
  const canvas = {} as HTMLCanvasElement
  const blob = new Blob(['png'], { type: 'image/png' })
  const clipboardItem = { kind: 'clipboard-item' } as unknown as ClipboardItem
  const renderCanvas = vi.fn(async (nextSvg: SVGSVGElement) => {
    expect(nextSvg).toBe(svg)
    return canvas
  })
  const blobFromCanvas = vi.fn(async (nextCanvas: HTMLCanvasElement, type: string) => {
    expect(nextCanvas).toBe(canvas)
    expect(type).toBe('image/png')
    return blob
  })
  const createClipboardItem = vi.fn((items: Record<string, Blob>) => {
    expect(items['image/png']).toBe(blob)
    return clipboardItem
  })
  const writeClipboard = vi.fn(async (items: ClipboardItem[]) => {
    expect(items).toEqual([clipboardItem])
  })

  await writeStickerPngToClipboard({
    blobFromCanvas,
    createClipboardItem,
    renderCanvas,
    svg,
    writeClipboard,
  })

  expect(renderCanvas).toHaveBeenCalledTimes(1)
  expect(blobFromCanvas).toHaveBeenCalledTimes(1)
  expect(createClipboardItem).toHaveBeenCalledTimes(1)
  expect(writeClipboard).toHaveBeenCalledTimes(1)
})
