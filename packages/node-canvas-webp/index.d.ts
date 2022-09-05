import 'canvas'

declare module 'canvas' {
  export interface WebpConfig {
    lossless?: boolean
    quality?: number
  }

  interface Canvas {
    toBuffer (cb: (err: Error | null, result: Buffer) => void, mimeType: 'image/webp', config?: WebpConfig): void
    toBuffer (mimeType: 'image/webp', config?: WebpConfig): Buffer
  }
}
