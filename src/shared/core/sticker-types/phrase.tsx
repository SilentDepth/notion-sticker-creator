import { Component as Frame } from './notion-logo-frame'
import { FACE_SIZE } from '@/shared/core/constants'
import {
  createPhraseGraphemes,
  createPhraseKey,
  normalizePhraseColor,
  normalizePhraseText,
  parsePhraseParams,
  type PhraseParams,
} from '@/shared/core/sticker-types/phrase-data.js'

export const normalizeText = normalizePhraseText
export const normalizeColor = normalizePhraseColor
export const parseParams = parsePhraseParams

export const getKey = (params: PhraseParams) =>
  createPhraseKey('phrase', createPhraseGraphemes({ ...params }))

const RE_EMOJI = /\p{Extended_Pictographic}/u

export interface ComponentProps extends PhraseParams {
  debug?: boolean
}

export function Component({ debug, ...params }: ComponentProps) {
  const graphemes = createPhraseGraphemes(params)
  const gridSize = Math.ceil(Math.sqrt(graphemes.length))
  const gridTemplate = `0.25fr repeat(${gridSize}, 1fr) 0.25fr`
  const fontSize = FACE_SIZE / (gridSize + 0.5)

  return (
    <Frame debug={debug}>
      <div
        style={{
          height: '100%',
          fontSize,
          fontFamily: 'Noto Serif SC',
          lineHeight: 1,
          display: 'grid',
          gridTemplateRows: gridTemplate,
          gridTemplateColumns: gridTemplate,
        }}
      >
        {graphemes.map((it, gIdx) => {
          const rowIdx = Math.floor(gIdx / gridSize)
          const colIdx = gIdx % gridSize
          return (
            <div
              key={gIdx}
              style={Object.assign(
                {
                  gridRowStart: rowIdx + 2,
                  gridColumnStart: colIdx + 2,
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  color: it.color,
                },
                debug ? { outline: '1px solid #f0f', outlineOffset: -1 } : undefined,
              )}
            >
              <span
                style={{
                  display: 'block',
                  transform: RE_EMOJI.test(it.value) ? 'translateX(-10%)' : 'translateY(-5%)',
                }}
              >
                {it.value}
              </span>
            </div>
          )
        })}
      </div>
    </Frame>
  )
}
