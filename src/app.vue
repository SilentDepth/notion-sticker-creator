<template lang="pug">
div(class="flex")
  input(v-model="text" type="text" placeholder="最多四个字符" class="w-32 text-center")
  div(class="relative ml-1 w-16")
    input(v-model="color" type="color" class="absolute inset-0 w-full h-full")

//div(class="flex" style="width: 600px;")
  input(v-model="matrix[0]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[1]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[2]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[3]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[4]" type="number" class="flex-1 min-w-0")
  input(v-model="matrix[5]" type="number" class="flex-1 min-w-0")
//input(v-model="fontSize" type="number" style="width: 100px;")

div(class="relative")
  canvas(ref="canvas" :width="size" :height="size" class="" @click="debug")
  //img(:src="imgSrc" class="absolute inset-0 w-full h-full")

</template>

<script setup>
import {computed, onMounted} from 'vue'
import frameUrl from '/src/assets/notion-logo-frame.png'

ref: canvas
// ref: imgSrc
ref: size = 320
ref: color = '#000'
ref: text = '你好世界'
ref: matrix = [618, -36, 0, 585, 128, 150]

const fontSize = computed(() => [0, 396, 200, 200, 200][text.length] / 512 * size)
const font = computed(() => `900 ${fontSize.value}px Noto Serif SC`)
const transform = computed(() => matrix.map((n, idx) => idx <= 3 ? n / 1000 : n / 512 * size))

let image
let flag = false

void function () {
  const img = new Image()
  img.src = frameUrl
  img.onload = () => image = img
}()

onMounted(() => {
  render()
})

function render () {
  const {width, height} = canvas
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, width, height)
  ctx.save()

  if (image) {
    ctx.drawImage(image, 0, 0, width, height)
  }

  ctx.setTransform(...transform.value)
  // ctx.fillStyle = '#0f06'
  // ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = color
  ctx.font = font.value
  switch (text.length) {
    case 0:
      break
    case 1:
      putText(ctx, text, 'center', width / 2, height / 2)
      break
    case 2:
      putText(ctx, text[0], 'bottom right', width / 2, height / 2)
      putText(ctx, text[1], 'top left', width / 2, height / 2)
      break
    // case 3:
    //   putText(ctx, text[0], 'bottom right', width / 2, height / 2)
    //   putText(ctx, text[1], 'bottom left', width / 2, height / 2)
    //   putText(ctx, text[2], 'top right', width / 2, height / 2)
    //   break
    default:
      putText(ctx, text[0], 'bottom right', width / 2, height / 2)
      putText(ctx, text[1], 'bottom left', width / 2, height / 2)
      putText(ctx, text[2], 'top right', width / 2, height / 2)
      putText(ctx, text[3] || '', 'top left', width / 2, height / 2)
  }
  flag = false

  ctx.restore()
  // imgSrc = canvas.toDataURL()
  requestAnimationFrame(render)
}

function debug () {
  flag = true
}

function putText (ctx, ch, origin, x, y) {
  const ox = /left|right/.exec(origin)?.[0] ?? 'center'
  const oy = /top|bottom/.exec(origin)?.[0] ?? 'center'

  ctx.save()
  const rx = {
    left: x,
    center: x - fontSize.value / 2,
    right: x - fontSize.value,
  }[ox]
  const ry = {
    top: y,
    center: y - fontSize.value / 2,
    bottom: y - fontSize.value,
  }[oy]
  // ctx.fillStyle = '#f0f' + [6, 9, 9, 6][text.indexOf(ch) % 4]
  // ctx.fillRect(rx, ry, fontSize.value, fontSize.value)
  ctx.restore()

  const {
    actualBoundingBoxLeft: left,
    actualBoundingBoxRight: right,
    actualBoundingBoxAscent: top,
    actualBoundingBoxDescent: bottom,
  } = ctx.measureText(ch)
  const width = left + right
  const height = top + bottom
  const fx = rx + left - width / 2 + fontSize.value / 2
  const fy = ry + top - height / 2 + fontSize.value / 2
  ctx.fillText(ch, fx, fy)

  if (flag) {
    // console.log(ch, fx, fy, {width, left, right})
  }
}
</script>
