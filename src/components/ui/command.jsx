import { Command as CommandPrimitive } from 'cmdk'
import { SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function Command({ className, ...props }) {
  return (
    <CommandPrimitive
      className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', className)}
      {...props}
    />
  )
}

function CommandInput({ className, ...props }) {
  return (
    <div className="flex items-center gap-2 border-b px-3" cmdk-input-wrapper="">
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }) {
  return <CommandPrimitive.List className={cn('max-h-[280px] overflow-y-auto overflow-x-hidden', className)} {...props} />
}

function CommandEmpty(props) {
  return <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground" {...props} />
}

function CommandGroup({ className, ...props }) {
  return (
    <CommandPrimitive.Group
      className={cn(
        'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CommandItem({ className, ...props }) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem }
