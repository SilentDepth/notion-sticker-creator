import { hash } from 'ohash'
import { IMAGE_NOTION_CALENDAR } from '@/shared/core/assets.js'

export const getKey = () => hash({ type: 'notion-calendar' })

export function Component() {
  return <img src={IMAGE_NOTION_CALENDAR} style={{ width: '100%', height: '100%' }} />
}
