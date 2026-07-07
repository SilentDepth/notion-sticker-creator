import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react'
import type { NotionStickerHandle } from '@/components/notion-sticker'
import { splitGraphemes, supportCanvasWebpDataURL } from '@/libs/feature-detect'
import { generateCanvas } from '@/libs/sticker-canvas'

export const MAX_STICKER_TEXT_LENGTH = 9
export const DEFAULT_STICKER_COLOR = '#000000'

export interface StickerEditorState {
  colorMatrixSize: number
  colors: string[]
  effectiveColors: string[]
  graphemes: string[]
  multiColor: boolean
  setMultiColor: (value: boolean) => void
  setText: (value: string) => void
  stickerColor: string
  stickerParams: {
    color: string
    text: string
  }
  text: string
  updateColor: (idx: number, value: string) => void
}

interface StickerExportOptions {
  colors: string[]
  effectiveColors: string[]
  multiColor: boolean
  stickerColor: string
  stickerRef: RefObject<NotionStickerHandle | null>
  text: string
}

export type StickerExportFormat = 'png' | 'webp'

type CanvasRenderer = (svg: SVGSVGElement) => Promise<HTMLCanvasElement>
type CanvasBlobber = (canvas: HTMLCanvasElement, type: string) => Promise<Blob>
type ClipboardItemFactory = (items: Record<string, Blob>) => ClipboardItem
type ClipboardWriter = (items: ClipboardItem[]) => Promise<void>

interface CreateStickerDownloadHrefOptions {
  format: StickerExportFormat
  renderCanvas?: CanvasRenderer
  stickerColor: string
  supportsWebp?: () => boolean
  svg: SVGSVGElement
  text: string
}

interface WriteStickerPngToClipboardOptions {
  blobFromCanvas?: CanvasBlobber
  createClipboardItem?: ClipboardItemFactory
  renderCanvas?: CanvasRenderer
  svg: SVGSVGElement
  writeClipboard?: ClipboardWriter
}

interface FormatBotCommandOptions {
  colors: string[]
  defaultColor?: string
  effectiveColors: string[]
  multiColor: boolean
  text: string
}

export function useStickerEditorState(initialText = '你好世界'): StickerEditorState {
  const [text, setText] = useState(initialText)
  const [colors, setColors] = useState([DEFAULT_STICKER_COLOR])
  const [multiColor, setMultiColor] = useState(false)

  const graphemes = useMemo(() => splitGraphemes(text), [text])
  const effectiveColors = useMemo(
    () => graphemes.map((_, idx) => colors[idx] || DEFAULT_STICKER_COLOR),
    [colors, graphemes],
  )
  const stickerColor = multiColor ? effectiveColors.join(',') : colors[0] || DEFAULT_STICKER_COLOR
  const colorMatrixSize = multiColor ? Math.ceil(Math.sqrt(Math.max(graphemes.length, 1))) : 1
  const stickerParams = useMemo(() => ({ text, color: stickerColor }), [stickerColor, text])

  useEffect(() => {
    setColors(current => {
      if (!multiColor) return [current[0] || DEFAULT_STICKER_COLOR]

      return Array.from(
        { length: Math.max(graphemes.length, 1) },
        (_, idx) => current[idx] || DEFAULT_STICKER_COLOR,
      )
    })
  }, [graphemes.length, multiColor])

  const updateColor = useCallback((idx: number, value: string) => {
    setColors(current => {
      const next = [...current]
      next[idx] = value
      return next
    })
  }, [])

  return {
    colorMatrixSize,
    colors,
    effectiveColors,
    graphemes,
    multiColor,
    setMultiColor,
    setText,
    stickerColor,
    stickerParams,
    text,
    updateColor,
  }
}

export function useStickerExport({
  colors,
  effectiveColors,
  multiColor,
  stickerColor,
  stickerRef,
  text,
}: StickerExportOptions) {
  const getStickerSvg = useCallback(() => {
    const svg = stickerRef.current?.getSvgElement()
    if (!svg) {
      throw new Error('Sticker preview is not ready')
    }
    return svg
  }, [stickerRef])

  const downloadSticker = useCallback(
    async (format: StickerExportFormat) => {
      const svg = getStickerSvg()
      const href = await createStickerDownloadHref({
        format,
        stickerColor,
        svg,
        text,
      })

      const anchor = document.createElement('a')
      anchor.href = href
      anchor.download = `notion-sticker.${format}`
      anchor.click()
      anchor.remove()
    },
    [getStickerSvg, stickerColor, text],
  )

  const copyStickerPng = useCallback(async () => {
    await writeStickerPngToClipboard({ svg: getStickerSvg() })
  }, [getStickerSvg])

  const copyCommand = useCallback(async () => {
    await navigator.clipboard.writeText(
      formatBotCommand({
        colors,
        effectiveColors,
        multiColor,
        text,
      }),
    )
  }, [colors, effectiveColors, multiColor, text])

  return {
    copyCommand,
    copyStickerPng,
    downloadSticker,
  }
}

export async function createStickerDownloadHref({
  format,
  renderCanvas = generateCanvas,
  stickerColor,
  supportsWebp = supportCanvasWebpDataURL,
  svg,
  text,
}: CreateStickerDownloadHrefOptions): Promise<string> {
  if (format === 'webp' && !supportsWebp()) {
    return `/api/sticker/${encodeURIComponent(text)}.webp?color=${encodeURIComponent(stickerColor)}`
  }

  const canvas = await renderCanvas(svg)
  return canvas.toDataURL(`image/${format}`)
}

export async function writeStickerPngToClipboard({
  blobFromCanvas = canvasToBlob,
  createClipboardItem = createBrowserClipboardItem,
  renderCanvas = generateCanvas,
  svg,
  writeClipboard = writeBrowserClipboard,
}: WriteStickerPngToClipboardOptions): Promise<void> {
  const type = 'image/png'
  const canvas = await renderCanvas(svg)
  const blob = await blobFromCanvas(canvas, type)
  await writeClipboard([createClipboardItem({ [type]: blob })])
}

export function formatBotCommand({
  colors,
  defaultColor = DEFAULT_STICKER_COLOR,
  effectiveColors,
  multiColor,
  text,
}: FormatBotCommandOptions): string {
  const commandColors = (multiColor ? effectiveColors : [colors[0] || defaultColor])
    .map(color => (color.toLowerCase() === defaultColor ? '' : color))
    .join(',')
    .replace(/^,+$/, '')

  return [
    '@NotionStickerBot',
    text.replaceAll(/([ =\\])/g, '\\$1'),
    commandColors ? `color=${commandColors}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create image blob'))
      }
    }, type)
  })
}

function createBrowserClipboardItem(items: Record<string, Blob>): ClipboardItem {
  const ClipboardItemCtor = globalThis.ClipboardItem
  if (!ClipboardItemCtor) {
    throw new Error('Clipboard image copy is unavailable in this browser')
  }
  return new ClipboardItemCtor(items)
}

function writeBrowserClipboard(items: ClipboardItem[]): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error('Clipboard image copy is unavailable in this browser')
  }
  return navigator.clipboard.write(items)
}
