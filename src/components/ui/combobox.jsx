import { useId, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { Label } from './label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

function Combobox({
  id,
  label,
  hideLabel = false,
  icon: Icon,
  error,
  helperText,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found.',
  options = [],
  value,
  onChange,
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false)
  const generatedId = useId()
  const fieldId = id || generatedId
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <Label htmlFor={fieldId} className={hideLabel ? 'sr-only' : undefined}>
          {label}
        </Label>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal',
              !selected && 'text-muted-foreground',
              error && 'border-destructive',
            )}
          >
            <span className="flex min-w-0 items-center gap-2 truncate">
              {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
              <span className="truncate">{selected ? selected.label : placeholder}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)]">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    disabled={option.disabled}
                    onSelect={() => {
                      onChange?.(option.value === value ? '' : option.value, option)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn('size-4', option.value === value ? 'opacity-100' : 'opacity-0')} />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  )
}

export { Combobox }
