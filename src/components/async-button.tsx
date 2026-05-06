import { type ButtonHTMLAttributes, type ReactNode, useState } from 'react'

interface AsyncButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick'
> {
  children: (done: boolean) => ReactNode
  doneIcon?: ReactNode
  onClick?: () => Promise<void> | void
}

export function AsyncButton({
  children,
  className = '',
  doneIcon,
  onClick,
  ...props
}: AsyncButtonProps) {
  const [done, setDone] = useState(false)

  async function handleClick() {
    await onClick?.()
    setDone(true)
    window.setTimeout(() => setDone(false), 2000)
  }

  return (
    <button className={`relative ${className}`} type="button" onClick={handleClick} {...props}>
      <span className={done ? 'opacity-0' : 'opacity-100'}>{children(done)}</span>
      {doneIcon ? (
        <span
          aria-hidden="true"
          className={`absolute inset-0 grid place-items-center ${done ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition duration-200 ease-in-out`}
        >
          {doneIcon}
        </span>
      ) : null}
    </button>
  )
}
