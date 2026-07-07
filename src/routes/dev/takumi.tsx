import { useToggle } from '@mantine/hooks'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { type RenderInput, type RenderOptions, renderSvg } from 'takumi-js'
import { requireDevRoute } from './-guard'
import { loadNotoSerifScFont } from '@/shared/core/assets'
import { STICKER_SIZE } from '@/shared/core/constants'
import * as sticker from '@/shared/core/sticker-types/phrase'

export const Route = createFileRoute('/dev/takumi')({
  beforeLoad: requireDevRoute,
  component: RouteComponent,
})

function RouteComponent() {
  const [debug, toggleDebug] = useToggle([true, false])
  const params = { text: '123', color: ',crimson' }
  const svg = useTakumi(<sticker.Component {...params} debug={debug} />, {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
  })
  const stickerKey = sticker.getKey(params)

  return (
    <div className="p-20 flex flex-col items-center">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="mt-20 text-sm text-white flex items-center gap-10">
        <p>
          <span className="text-gray-500">Key:</span>&nbsp;<code>{stickerKey}</code>
        </p>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={debug} onChange={() => toggleDebug()} />
          <span>Debug</span>
        </label>
      </div>
    </div>
  )
}

function useTakumi(node: RenderInput, options?: RenderOptions) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    void (async function () {
      const notoSerifSC = await loadNotoSerifScFont()
      await renderSvg(node, {
        ...options,
        emoji: 'noto',
        fonts: [
          {
            name: 'Noto Serif SC',
            weight: 400,
            style: 'normal',
            data: notoSerifSC,
          },
        ],
      }).then(setSvg)
    })()
  }, [node, options])

  return svg
}
