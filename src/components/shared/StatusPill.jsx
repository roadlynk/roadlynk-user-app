import { cn } from '@/lib/utils'

export function StatusPill({ active, activeLabel = 'Active', inactiveLabel = 'Inactive' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide',
        active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700',
      )}
    >
      <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-red-500')} />
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
