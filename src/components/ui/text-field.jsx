import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Label } from './label'

const TextField = forwardRef(function TextField(
  { id, label, hideLabel = false, icon: Icon, error, helperText, className, inputClassName, trailing, ...inputProps },
  ref,
) {
  const generatedId = useId()
  const fieldId = id || generatedId

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <Label htmlFor={fieldId} className={hideLabel ? 'sr-only' : undefined}>
          {label}
        </Label>
      ) : null}
      <div className="relative flex items-center">
        {Icon ? <Icon className="pointer-events-none absolute left-3 size-4 text-muted-foreground" /> : null}
        <Input
          ref={ref}
          id={fieldId}
          className={cn(Icon && 'pl-9', trailing && 'pr-9', error && 'border-destructive focus-visible:ring-destructive', inputClassName)}
          {...inputProps}
        />
        {trailing}
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  )
})

const PasswordField = forwardRef(function PasswordField({ label = 'Password', ...props }, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      ref={ref}
      label={label}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className="absolute right-1.5 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  )
})

// A number input that never accepts a negative value (blocked on keypress
// and stripped on paste/typed input, not just on blur like the native `min`
// attribute would do).
const NumberField = forwardRef(function NumberField({ min = 0, max, step = 1, value, onChange, inputClassName, ...props }, ref) {
  function handleChange(event) {
    const raw = event.target.value
    onChange?.({ target: { value: raw.startsWith('-') ? raw.slice(1) : raw } })
  }

  function handleKeyDown(event) {
    if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
      event.preventDefault()
    }
  }

  return (
    <TextField
      ref={ref}
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      inputClassName={cn('[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none', inputClassName)}
      {...props}
    />
  )
})

export { TextField, PasswordField, NumberField }
