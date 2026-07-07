import { useIntersection } from '@mantine/hooks'
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import MingcuteCheckLine from '~icons/mingcute/check-line'
import MingcuteCopy2Line from '~icons/mingcute/copy-2-line'
import MingcuteDownload2Line from '~icons/mingcute/download-2-line'
import MingcuteFileDownloadLine from '~icons/mingcute/file-download-line'
import MingcuteGithubLine from '~icons/mingcute/github-line'
import MingcutePaletteLine from '~icons/mingcute/palette-line'
import MingcuteTelegramLine from '~icons/mingcute/telegram-line'
import MingcuteText2Line from '~icons/mingcute/text-2-line'
import { AsyncButton } from '@/components/async-button'
import { ColorInput } from '@/components/color-input'
import { NotionSticker, type NotionStickerHandle } from '@/components/notion-sticker'
import {
  DEFAULT_STICKER_COLOR,
  MAX_STICKER_TEXT_LENGTH,
  useStickerEditorState,
  useStickerExport,
} from '@/features/sticker-editor'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const stickerRef = useRef<NotionStickerHandle>(null)
  const { ref: stickyRef, entry } = useIntersection({ threshold: 1 })
  const isStickyTriggered = entry ? !entry.isIntersecting : false
  const {
    colorMatrixSize,
    effectiveColors,
    graphemes,
    multiColor,
    setMultiColor,
    setText,
    stickerParams,
    text,
    updateColor,
    ...exportState
  } = useStickerEditorState()
  const { copyCommand, copyStickerPng, downloadSticker } = useStickerExport({
    ...exportState,
    effectiveColors,
    multiColor,
    stickerRef,
    text,
  })

  return (
    <main className="isolate min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <img src="/icon.png" alt="" className="size-16" />
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-balance">
              Notion 贴纸生成器
            </h1>
            <p className="max-w-[56ch] text-base text-pretty text-neutral-400 sm:text-sm">
              生成 Notion 中文社区贴纸风格的文字贴纸，并导出 PNG、WebP 或 Bot 命令。
            </p>
          </div>
        </header>

        <div ref={stickyRef} className="h-px translate-y-6" />
        <section
          className={`sticky top-0 z-10 mt-6 w-screen border-b px-5 py-4 backdrop-blur sm:px-6 ${
            isStickyTriggered
              ? 'border-white/10 bg-neutral-950/85'
              : 'border-transparent bg-neutral-950/55'
          }`}
        >
          <NotionSticker ref={stickerRef} className="mx-auto size-64" params={stickerParams} />
        </section>

        <section className="mt-8 grid w-full max-w-3xl gap-8">
          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-base text-neutral-200 sm:text-sm">
              <MingcuteText2Line className="size-4 shrink-0 text-neutral-400" />
              <h2 className="font-medium">文字</h2>
              <span className="ml-auto tabular-nums text-neutral-500">
                {graphemes.length}/{MAX_STICKER_TEXT_LENGTH}
              </span>
            </div>
            <input
              aria-label="贴纸文字"
              className="h-12 rounded-md bg-neutral-900 px-4 text-center text-xl text-white ring-1 ring-white/10 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-10 sm:text-lg"
              maxLength={MAX_STICKER_TEXT_LENGTH}
              name="text"
              type="text"
              value={text}
              onChange={event => setText(event.currentTarget.value)}
            />
          </div>

          <div className="grid justify-items-center gap-4">
            <div className="flex w-full items-center gap-2 text-base text-neutral-200 sm:text-sm">
              <MingcutePaletteLine className="size-4 shrink-0 text-neutral-400" />
              <h2 className="font-medium">颜色</h2>
              <label className="ml-auto flex items-center gap-2 text-base text-neutral-300 sm:text-sm">
                <span>逐字设定</span>
                <span className="group outline-blue-500 has-checked:bg-blue-600 relative inline-flex w-11 shrink-0 rounded-full bg-neutral-800 p-0.5 inset-ring inset-ring-white/10 outline-offset-2 transition-colors duration-200 ease-in-out has-focus-visible:outline-2 sm:w-9">
                  <span className="aspect-square w-1/2 rounded-full bg-white shadow-xs ring-1 ring-neutral-950/10 transition-transform duration-200 ease-in-out group-has-checked:translate-x-full" />
                  <input
                    checked={multiColor}
                    className="absolute inset-0 size-full appearance-none focus:outline-hidden"
                    name="multiColor"
                    type="checkbox"
                    onChange={event => setMultiColor(event.currentTarget.checked)}
                  />
                </span>
              </label>
            </div>

            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: `repeat(${colorMatrixSize}, 2.75rem)`,
                gridTemplateRows: `repeat(${colorMatrixSize}, 2.75rem)`,
              }}
            >
              {Array.from({ length: colorMatrixSize ** 2 }, (_, idx) => {
                const disabled = idx >= graphemes.length || graphemes[idx] === ' '
                return (
                  <ColorInput
                    key={idx}
                    className={`ring-1 ring-neutral-500/70 ${cellRadius(idx, colorMatrixSize)}`}
                    disabled={disabled}
                    disabledClassName="ring-neutral-800"
                    value={effectiveColors[idx] || DEFAULT_STICKER_COLOR}
                    onChange={value => updateColor(idx, value)}
                  />
                )
              })}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-base text-neutral-200 sm:text-sm">
              <MingcuteFileDownloadLine className="size-4 shrink-0 text-neutral-400" />
              <h2 className="font-medium">导出</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 py-2 pr-3 pl-2 text-base font-medium text-white ring-1 ring-blue-600 outline-none hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:text-sm"
                disabled={!text}
                type="button"
                onClick={() => downloadSticker('webp')}
              >
                <MingcuteDownload2Line className="size-4 shrink-0" />
                下载 WebP
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white/8 py-2 pr-3 pl-2 text-base font-medium text-white ring-1 ring-white/10 outline-none hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:text-sm"
                disabled={!text}
                type="button"
                onClick={() => downloadSticker('png')}
              >
                <MingcuteDownload2Line className="size-4 shrink-0" />
                下载 PNG
              </button>
              <AsyncButton
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white/8 py-2 pr-3 pl-2 text-base font-medium text-white ring-1 ring-white/10 outline-none hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:text-sm"
                disabled={!text}
                doneIcon={<MingcuteCheckLine className="size-4 text-emerald-300" />}
                onClick={copyStickerPng}
              >
                {() => (
                  <span className="inline-flex items-center gap-2">
                    <MingcuteCopy2Line className="size-4 shrink-0" />
                    复制 PNG
                  </span>
                )}
              </AsyncButton>
            </div>

            <AsyncButton
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white/8 py-2 pr-3 pl-2 text-base font-medium text-white ring-1 ring-white/10 outline-none hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:text-sm"
              disabled={!text}
              doneIcon={<MingcuteCheckLine className="size-4 text-emerald-300" />}
              onClick={copyCommand}
            >
              {() => (
                <span className="inline-flex items-center gap-2">
                  <MingcuteTelegramLine className="size-4 shrink-0" />
                  复制 Bot 命令
                </span>
              )}
            </AsyncButton>
          </div>
        </section>

        <footer className="mt-12">
          <a
            className="inline-flex size-12 items-center justify-center rounded-md text-neutral-500 outline-none hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            href="https://github.com/SilentDepth/notion-sticker-creator"
            rel="noreferrer"
            target="_blank"
          >
            <span className="sr-only">GitHub</span>
            <MingcuteGithubLine className="size-5" />
          </a>
        </footer>
      </div>
    </main>
  )
}

function cellRadius(idx: number, size: number): string {
  const classes = []
  if (idx === 0) classes.push('rounded-tl-md')
  if (idx === size - 1) classes.push('rounded-tr-md')
  if (idx === size * (size - 1)) classes.push('rounded-bl-md')
  if (idx === size ** 2 - 1) classes.push('rounded-br-md')
  return classes.join(' ')
}
