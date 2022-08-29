import { Buffer } from 'node:buffer'
import type { VercelApiHandler } from '@vercel/node'
import sharp from 'sharp'

export default <VercelApiHandler>async function (req, res) {
  const png = Buffer.from(req.body, 'base64')
  res
    .setHeader('Content-Type', 'image/webp')
    .end(await sharp(png).toFormat('webp').toBuffer())
}
