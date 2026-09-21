import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      className={cn(
        'flex min-h-[5.5rem] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})

export { Textarea }
