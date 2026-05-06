interface ColorInputProps {
  className?: string
  disabled?: boolean
  disabledClassName?: string
  onChange: (value: string) => void
  value?: string
}

export function ColorInput({
  className = '',
  disabled = false,
  disabledClassName = '',
  onChange,
  value = '#000000',
}: ColorInputProps) {
  return (
    <div
      className={`flex ${className} ${disabled ? disabledClassName : ''}`}
      style={{ backgroundColor: disabled ? '#111111' : value || '#000000' }}
    >
      <input
        aria-label="文字颜色"
        className="size-full cursor-pointer opacity-0 disabled:cursor-default"
        disabled={disabled}
        name="color"
        type="color"
        value={value || '#000000'}
        onChange={event => onChange(event.currentTarget.value)}
      />
    </div>
  )
}
