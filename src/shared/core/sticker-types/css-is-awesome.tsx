import { hash } from 'ohash'
import { Component as Frame } from './notion-logo-frame'

export const getKey = () => hash({ type: 'css-is-awesome' })

export interface ComponentProps {
  debug?: boolean
}

export function Component({ debug }: ComponentProps) {
  const pStyle = Object.assign(
    { margin: 0 },
    debug ? { outline: '1px solid #f0f', outlineOffset: -1 } : undefined,
  )
  const spanStyle = { display: 'block', transform: 'translateY(-5%)' }

  return (
    <Frame debug={debug}>
      <div
        style={{
          height: '100%',
          padding: '4px 12px',
          fontFamily: 'Noto Serif SC',
          fontSize: 81,
          lineHeight: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <p style={pStyle}>
          <span style={spanStyle}>CSS</span>
        </p>
        <p style={pStyle}>
          <span style={spanStyle}>IS</span>
        </p>
        <p style={pStyle}>
          <span style={spanStyle}>AWESOME</span>
        </p>
      </div>
    </Frame>
  )
}
