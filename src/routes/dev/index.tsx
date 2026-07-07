import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { requireDevRoute } from './-guard'
import { NotionSticker } from '@/components/notion-sticker'

type Demo = 'phrase' | 'calendar' | 'css-is-awesome'

export const Route = createFileRoute('/dev/')({ beforeLoad: requireDevRoute, component: Dev })

function Dev() {
  const [demo, setDemo] = useState<Demo>('phrase')
  const [debug, setDebug] = useState(false)
  const [phraseText, setPhraseText] = useState('##goldenrod=天地\n玄黄\n  #crimson=🌧️宙\n  洪荒$')
  const [date, setDate] = useState('')
  const [color, setColor] = useState('#dc143c')
  const [locale, setLocale] = useState('')

  return (
    <main className="min-h-dvh flex flex-col text-neutral-200 antialiased">
      <nav className="flex flex-wrap justify-center border-b border-white/10">
        {(['phrase', 'calendar', 'css-is-awesome'] as const).map(item => (
          <button
            key={item}
            className={`h-10 px-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:text-sm ${
              demo === item ? 'font-medium text-white' : 'text-neutral-400 hover:text-white'
            }`}
            type="button"
            onClick={() => setDemo(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        {demo === 'calendar' ? (
          <NotionSticker
            debug={debug}
            className="size-80 max-w-full"
            params={{
              color,
              date: date || undefined,
              locale: locale || undefined,
            }}
            template="calendar"
          />
        ) : null}

        {demo === 'css-is-awesome' ? (
          <NotionSticker debug={debug} className="size-80 max-w-full" template="css-is-awesome" />
        ) : null}

        {demo === 'phrase' ? (
          <NotionSticker
            debug={debug}
            className="size-80 max-w-full"
            params={{ max: Infinity, text: phraseText }}
            template="phrase"
          />
        ) : null}

        <div className="flex flex-wrap items-end justify-center gap-3 text-base sm:text-sm">
          <label className="flex items-center gap-2">
            <input
              checked={debug}
              className="size-5 accent-blue-500 sm:size-4"
              name="debug"
              type="checkbox"
              onChange={event => setDebug(event.currentTarget.checked)}
            />
            <span>Debug</span>
          </label>

          {demo === 'phrase' ? (
            <label className="grid gap-1">
              <span className="font-mono text-neutral-400">text</span>
              <input
                className="h-9 w-72 rounded-md bg-white px-2 text-black outline-none focus-visible:outline-2 focus-visible:outline-blue-500"
                name="phraseText"
                type="text"
                value={phraseText}
                onChange={event => setPhraseText(event.currentTarget.value)}
              />
            </label>
          ) : null}

          {demo === 'calendar' ? (
            <>
              <label className="grid gap-1">
                <span className="font-mono text-neutral-400">date</span>
                <input
                  className="h-9 rounded-md bg-white px-2 text-black outline-none focus-visible:outline-2 focus-visible:outline-blue-500"
                  name="date"
                  type="date"
                  value={date}
                  onChange={event => setDate(event.currentTarget.value)}
                />
              </label>
              <label className="grid gap-1">
                <span className="font-mono text-neutral-400">color</span>
                <input
                  className="h-9 rounded-md bg-white px-2 text-black outline-none focus-visible:outline-2 focus-visible:outline-blue-500"
                  name="calendarColor"
                  type="color"
                  value={color}
                  onChange={event => setColor(event.currentTarget.value)}
                />
              </label>
              <label className="grid gap-1">
                <span className="font-mono text-neutral-400">locale</span>
                <input
                  className="h-9 w-24 rounded-md bg-white px-2 text-black outline-none focus-visible:outline-2 focus-visible:outline-blue-500"
                  name="locale"
                  type="text"
                  value={locale}
                  onChange={event => setLocale(event.currentTarget.value)}
                />
              </label>
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}
