import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/design')({ component: Design })

function Design() {
  const [stickerMode, setStickerMode] = useState(false)
  const [transform, setTransform] = useState(true)
  const [debug, setDebug] = useState(false)

  return (
    <main className="isolate flex min-h-dvh flex-col items-center justify-center gap-5 bg-neutral-800 p-6 text-neutral-200 antialiased">
      <div
        className="relative size-[32rem] bg-[url('/assets/notion-logo-frame.png')] bg-cover text-black"
        style={{
          fontFamily: 'Noto Serif SC',
          fontWeight: 700,
          transform: stickerMode ? `scale(${208 / 512})` : undefined,
        }}
      >
        <div
          className="flex size-[19.75rem] origin-top-left flex-col items-start"
          style={{
            background: transform ? undefined : 'white',
            fontSize: '124px',
            lineHeight: 1,
            transform: transform
              ? 'translate(128px, 151px) scaleY(0.943) skewY(-3.52deg)'
              : undefined,
          }}
        >
          <span
            className={
              debug
                ? 'flex items-center bg-emerald-500/40 ring-1 ring-fuchsia-500'
                : 'flex items-center'
            }
          >
            CSS
          </span>
          <span
            className={
              debug
                ? 'my-auto flex items-center bg-emerald-500/40 ring-1 ring-fuchsia-500'
                : 'my-auto flex items-center'
            }
          >
            IS
          </span>
          <span
            className={
              debug
                ? 'flex items-center bg-emerald-500/40 ring-1 ring-fuchsia-500'
                : 'flex items-center'
            }
          >
            AWESOME
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-base sm:text-sm">
        <Toggle label="Sticker size" value={stickerMode} onChange={setStickerMode} />
        <Toggle label="Transform" value={transform} onChange={setTransform} />
        <Toggle label="Debug" value={debug} onChange={setDebug} />
      </div>
    </main>
  )
}

function Toggle({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: boolean) => void
  value: boolean
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        checked={value}
        className="size-5 accent-blue-500 sm:size-4"
        name={label}
        type="checkbox"
        onChange={event => onChange(event.currentTarget.checked)}
      />
      <span>{label}</span>
    </label>
  )
}
