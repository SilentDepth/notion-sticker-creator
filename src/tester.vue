<script setup>
import { onMounted } from 'vue'

let canvas = $ref(null)
let text = $ref('永')
let textMetrics = $ref(null)

onMounted(async () => {
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 200, 200)

  ctx.fillStyle = '#0f0'
  ctx.fillRect(50, 50, 100, 100)

  ctx.font = '700 100px Noto Serif SC'
  await document.fonts.load(ctx.font, text)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const _textMetrics = ctx.measureText(text)
  textMetrics = {
    actualBoundingBoxAscent: _textMetrics.actualBoundingBoxAscent,
    actualBoundingBoxDescent: _textMetrics.actualBoundingBoxDescent,
  }
  // ctx.strokeStyle = '#f0f'
  // ctx.stroke(new Path2D(`M 50 ${100 + textMetrics.actualBoundingBoxDescent} h 100`))
  // ctx.stroke(new Path2D(`M 50 ${100 - textMetrics.actualBoundingBoxAscent} h 100`))
  const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
  const idealDescent = (actualHeight - 100) / 2
  ctx.fillStyle = '#000'
  ctx.fillText(text, 100, 150 + idealDescent - textMetrics.actualBoundingBoxDescent)
})
</script>

<template lang="pug">
canvas(ref="canvas" width="200" height="200" style="width: 200px; height: 200px;")
pre(class="text-xs text-white") {{ JSON.stringify(textMetrics, null, 2) }}
</template>
