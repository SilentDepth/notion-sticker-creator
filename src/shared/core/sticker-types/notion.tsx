import { hash } from 'ohash'
import { IMAGE_NOTION } from '@/shared/core/assets'

export const getKey = () => hash({ type: 'notion' })

export function Component() {
  // TODO: A better way to handle image assets?
  return <img src={IMAGE_NOTION} style={{ width: '100%', height: '100%' }} />
}
