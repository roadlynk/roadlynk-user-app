import { forwardRef, useId } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Combobox } from './combobox'
import { Label } from './label'
import { Textarea } from './textarea'

// A searchable dropdown, kept under the historic "SelectField" name so every
// existing call site (which all treat it like a native <select> — value +
// onChange(event) => event.target.value) gets search for free.
export function SelectField({ id, label, hideLabel = false, options = [], placeholder = 'Select', error, helperText, required, className, value, onChange, disabled, ...rest }) {
  const generatedId = useId()
  const fieldId = id || generatedId

  return (
    <Combobox
      id={fieldId}
      label={label}
      hideLabel={hideLabel}
      options={options}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      className={className}
      value={value}
      onChange={(nextValue) => {
        if (required && nextValue === '') return
        onChange?.({ target: { value: nextValue } })
      }}
      disabled={disabled}
      {...rest}
    />
  )
}

export const TextAreaField = forwardRef(function TextAreaField(
  { id, label, hideLabel = false, rows = 3, error, helperText, className, ...textareaProps },
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
      <Textarea ref={ref} id={fieldId} rows={rows} className={cn(error && 'border-destructive')} {...textareaProps} />
      {error ? <p className="text-xs text-destructive">{error}</p> : helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  )
})

export function CheckboxField({ label, hint, checked, onChange, className }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 rounded-md border border-border bg-secondary/40 px-3.5 py-3', className)}>
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} className="mt-0.5" />
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  )
}

export function ReadOnlyField({ label, value, hint, className }) {
  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <Label className="text-muted-foreground">{label}</Label>
      <div className="flex h-10 w-full items-center rounded-md border border-dashed border-input bg-secondary/30 px-3 text-sm text-foreground">
        {value || '—'}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function FormSection({ title, description, children, className }) {
  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function TableShell({ toolbar, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/92 shadow-card backdrop-blur-xl">
      {toolbar ? <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">{toolbar}</div> : null}
      {children}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="px-6 py-16 text-center">
      {Icon ? <Icon className="mx-auto size-8 text-muted-foreground/50" /> : null}
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function PageForm({ title, backTo, onCancel, onSubmit, submitLabel = 'Save', pending, error, children }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        {backTo ? (
          <Button asChild variant="outline" size="icon" aria-label="Back">
            <Link to={backTo} relative="path">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        ) : null}
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>

      <div className="space-y-8 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">{children}</div>

      {error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="accent-fill">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
