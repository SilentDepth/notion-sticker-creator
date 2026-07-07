import { stickerRegistry } from '@/shared/core/sticker-types'
import type { StickerInstance, StickerParams, StickerType } from '@/shared/core/sticker-types'

export * from '@/shared/core/sticker-types'

export default function createSticker<T extends StickerType>(
  type: T,
  params?: StickerParams<T>,
): StickerInstance<T>
export default function createSticker<T extends StickerType>(
  type: T,
  params?: StickerParams<T>,
): StickerInstance<T> {
  return stickerRegistry[type].create(params as never) as StickerInstance<T>
}
