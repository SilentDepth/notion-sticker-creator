type Matrix = [number, number, number, number, number, number]

export async function generateCanvas(svg: SVGSVGElement): Promise<HTMLCanvasElement> {
  const image = svg.querySelector('image')
  const imageHref = image?.getAttribute('href')

  const img = new Image()
  if (imageHref) {
    img.src = imageHref
    await waitForImage(img)
  }

  const canvas = document.createElement('canvas')
  canvas.width = Number(svg.getAttribute('width') || 512)
  canvas.height = Number(svg.getAttribute('height') || 512)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable')
  }

  if (imageHref) {
    ctx.drawImage(img, 0, 0)
  }

  for (const path of svg.querySelectorAll('path')) {
    const transform = path.getAttribute('transform')
    const d = path.getAttribute('d')
    const fill = path.getAttribute('fill')

    if (!d || !fill) continue

    ctx.save()
    if (transform?.startsWith('matrix(')) {
      ctx.transform(...parseMatrix(transform))
    }
    ctx.fillStyle = fill
    ctx.fill(new Path2D(d))
    ctx.restore()
  }

  return canvas
}

async function waitForImage(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return

  if ('decode' in img) {
    await img.decode().catch(() => undefined)
    if (img.complete && img.naturalWidth > 0) return
  }

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load sticker frame'))
  })
}

function parseMatrix(value: string): Matrix {
  return value
    .slice('matrix('.length, -1)
    .split(',')
    .map(n => Number(n.trim())) as Matrix
}
