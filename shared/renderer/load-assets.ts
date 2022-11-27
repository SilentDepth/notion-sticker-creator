interface Assets {
  frame: string
  font: Buffer | ArrayBuffer
}

export default async function loadAssets (): Promise<Assets> {
  const frame: Assets['frame'] = await Promise.resolve().then(async () => {
    // If it's in browser (Vite-processed)
    if (typeof window !== 'undefined') {
      const img = new Image()
      img.src = '/assets/notion-logo-frame.png'
      await new Promise(resolve => img.onload = resolve)

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      return canvas.toDataURL()
    }
    // Otherwise it's in Node
    else {
      const encoded = require('./read-asset')('notion-logo-frame.png').toString('base64')
      return `data:image/png;base64,${encoded}`
    }
  })

  const font: Assets['font'] = await Promise.resolve().then(async () => {
    // If it's in browser (Vite-processed)
    if (typeof window !== 'undefined') {
      return await fetch('/assets/NotoSerifSC-Bold.otf').then(res => res.arrayBuffer())
    }
    // Otherwise it's in Node
    else {
      return require('./read-asset')('NotoSerifSC-Bold.otf')
    }
  })

  return {
    frame,
    font,
  }
}
