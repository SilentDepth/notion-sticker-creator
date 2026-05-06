import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import createSticker, { type StickerParams, type StickerType } from '@/shared/core'

const EMPTY_PARAMS = {}

export interface NotionStickerHandle {
  getSvgElement: () => SVGSVGElement | null
}

interface NotionStickerProps<T extends StickerType = StickerType> {
  className?: string
  debug?: boolean
  params?: StickerParams<T>
  template?: T
}

export const NotionSticker = forwardRef<NotionStickerHandle, NotionStickerProps>(
  function NotionSticker(
    { className = '', debug = false, params = EMPTY_PARAMS, template = 'phrase' },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null)
    const [svg, setSvg] = useState('')

    const sticker = useMemo(() => createSticker(template, params), [params, template])

    useImperativeHandle(ref, () => ({
      getSvgElement: () => rootRef.current?.querySelector('svg') ?? null,
    }))

    useEffect(() => {
      let cancelled = false

      void sticker
        .render(debug)
        .then(result => {
          if (!cancelled) {
            setSvg(result)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSvg('')
          }
        })

      return () => {
        cancelled = true
      }
    }, [debug, sticker])

    return (
      <div
        ref={rootRef}
        className={`[&_svg]:size-full ${className}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  },
)
