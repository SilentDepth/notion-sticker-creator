import { createFileRoute } from '@tanstack/react-router'
import { use } from 'react'
import { renderSvg } from 'takumi-js'

export const Route = createFileRoute('/takumi')({
  component: RouteComponent,
})

const svgCreator = renderSvg(<div tw="size-40 bg-purple-500"></div>)

function RouteComponent() {
  const svg = use(svgCreator)

  return (
    <div className="p-20">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}
