import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Loader2, Pencil, Plus, Power, Search, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, TableShell } from '@/components/ui/form-kit'
import { cn } from '@/lib/utils'
import { listOwnersApi, updateOwnerActiveStatusApi } from '@/lib/owner-service'

const RENTAL_FILTERS = [
  { value: 'ASSET', label: 'Asset' },
  { value: 'CREDIT', label: 'Credit' },
]

export default function OwnerList() {
  const { company } = useOutletContext()
  const companyId = company._id

  const [search, setSearch] = useState('')
  const [rentalFilter, setRentalFilter] = useState('ASSET')
  const [showInactive, setShowInactive] = useState(false)
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const refreshOwners = useCallback(async () => {
    setError(null)
    try {
      const response = await listOwnersApi({ companyId, active: !showInactive })
      setOwners(response ?? [])
    } catch (fetchError) {
      setError(fetchError.response?.data?.message ?? 'Unable to load owners.')
      setOwners([])
    }
  }, [companyId, showInactive])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refreshOwners().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshOwners])

  const byRental = useMemo(
    () => owners.filter((owner) => (rentalFilter === 'CREDIT' ? owner.isRental : !owner.isRental)),
    [owners, rentalFilter],
  )

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return byRental
    return byRental.filter((owner) =>
      [owner.name, owner.panNumber, owner.phoneNumber, owner.email].filter(Boolean).some((value) => value.toLowerCase().includes(q)),
    )
  }, [byRental, search])

  async function toggleActive(owner) {
    setTogglingId(owner._id)
    setError(null)
    try {
      await updateOwnerActiveStatusApi(owner._id, { isActive: !owner.isActive })
      await refreshOwners()
    } catch (toggleError) {
      setError(toggleError.response?.data?.message ?? 'Unable to update owner status.')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Owners</h2>
          <p className="mt-1 text-sm text-muted-foreground">Truck owners onboarded to this company.</p>
        </div>
        <Button asChild className="accent-fill">
          <Link to="new">
            <Plus className="size-4" />
            New owner
          </Link>
        </Button>
      </div>

      <TableShell
        toolbar={
          <>
            <div className="relative min-w-[14rem] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, PAN, phone or email"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div role="group" aria-label="Filter by account group" className="inline-flex rounded-md border border-border bg-secondary/50 p-1">
              {RENTAL_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={rentalFilter === filter.value}
                  onClick={() => setRentalFilter(filter.value)}
                  className={cn(
                    'rounded-[5px] px-3 py-1.5 text-xs font-semibold transition-colors',
                    rentalFilter === filter.value ? 'accent-fill shadow-accent' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
              Show inactive
              <button
                type="button"
                role="switch"
                aria-checked={showInactive}
                onClick={() => setShowInactive((value) => !value)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                  showInactive ? 'accent-fill' : 'bg-secondary',
                )}
              >
                <span
                  className={cn(
                    'inline-block size-4 transform rounded-full bg-background shadow transition-transform',
                    showInactive ? 'translate-x-6' : 'translate-x-1',
                  )}
                />
              </button>
            </label>

            <p className="text-xs text-muted-foreground">{rows.length} shown</p>
          </>
        }
      >
        {error ? (
          <p role="alert" className="mx-5 mt-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="px-6 py-16 text-center">
            <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">Loading owners…</p>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={UserRound} title="No owners found" description="Try a different search or filter, or add a new owner." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Owner</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((owner) => (
                  <tr key={owner._id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{owner.name}</p>
                      <p className="text-xs text-muted-foreground">{owner.panNumber}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{owner.email || '—'}</td>
                    <td className="px-5 py-4 text-muted-foreground">{owner.phoneNumber || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={owner._id}
                          state={{ editingOwner: owner }}
                          aria-label={`Edit ${owner.name}`}
                          title="Edit"
                          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleActive(owner)}
                          disabled={togglingId === owner._id}
                          aria-label={`${owner.isActive ? 'Disable' : 'Enable'} ${owner.name}`}
                          title={owner.isActive ? 'Disable owner' : 'Enable owner'}
                          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
                        >
                          {togglingId === owner._id ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TableShell>
    </div>
  )
}
