import { hash } from 'ohash'
import type { PropsWithChildren } from 'react'
import { IMAGE_FRAME } from '@/shared/core/assets'

export const getKey = () => hash({ type: 'notion-logo-frame' })

export interface ComponentProps extends PropsWithChildren {
  debug?: boolean
}

export function Component({ debug, children }: ComponentProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <img
        src={IMAGE_FRAME}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />
      <div
        style={Object.assign(
          {
            width: '61.71875%',
            height: '61.71875%',
            transform: 'translate(40.5063291139%, 47.7848101266%) scaleY(0.943) skewY(-3.52deg)',
            transformOrigin: 'top left',
          },
          debug
            ? {
                background: '#0f03',
              }
            : undefined,
        )}
      >
        {children}
      </div>
    </div>
  )
}
