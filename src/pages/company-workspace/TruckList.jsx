import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Loader2, Pencil, Plus, Search, Truck as TruckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Combobox } from '@/components/ui/combobox'
import { EmptyState, TableShell } from '@/components/ui/form-kit'
import { cn } from '@/lib/utils'
import { listTrucksApi, updateTrucksActiveStatusApi } from '@/lib/truck-service'

export default function TruckList() {
  const { company } = useOutletContext()
  const companyId = company._id

  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [ownerFilter, setOwnerFilter] = useState('')
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [bulkPending, setBulkPending] = useState(false)

  const refreshTrucks = useCallback(async () => {
    setError(null)
    try {
      const data = await listTrucksApi({ companyId, active: !showInactive })
      setTrucks(data ?? [])
    } catch (fetchError) {
      setError(fetchError.response?.data?.message ?? 'Unable to load trucks.')
      setTrucks([])
    }
  }, [companyId, showInactive])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setSelectedIds(new Set())
    setOwnerFilter('')
    refreshTrucks().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshTrucks])

  const ownerOptions = useMemo(() => {
    const byId = new Map()
    for (const truck of trucks) {
      if (truck.owner && !byId.has(truck.owner._id)) byId.set(truck.owner._id, truck.owner.name)
    }
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [trucks])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return trucks.filter((truck) => {
      if (ownerFilter && truck.owner?._id !== ownerFilter) return false
      if (!q) return true
      return [truck.truckNumber, truck.manufacturer, truck.owner?.name, truck.owner?.phoneNumber]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    })
  }, [trucks, search, ownerFilter])

  const allSelected = rows.length > 0 && rows.every((truck) => selectedIds.has(truck._id))
  const someSelected = rows.some((truck) => selectedIds.has(truck._id))

  function toggleAll(checked) {
    setSelectedIds(checked ? new Set(rows.map((truck) => truck._id)) : new Set())
  }

  function toggleOne(truckId, checked) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(truckId)
      else next.delete(truckId)
      return next
    })
  }

  async function handleBulkStatusChange() {
    const truckIds = Array.from(selectedIds)
    if (truckIds.length === 0) return
    const nextIsActive = showInactive // flipping from inactive list -> active, or from active list -> inactive
    setBulkPending(true)
    setError(null)
    try {
      await updateTrucksActiveStatusApi({ truckIds, isActive: nextIsActive })
      setSelectedIds(new Set())
      setOwnerFilter('')
      await refreshTrucks()
    } catch (bulkError) {
      setError(bulkError.response?.data?.message ?? 'Unable to update the selected trucks.')
    } finally {
      setBulkPending(false)
    }
  }


  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Trucks</h2>
          <p className="mt-1 text-sm text-muted-foreground">Trucks onboarded to this company.</p>
        </div>
        <Button asChild className="accent-fill">
          <Link to="new">
            <Plus className="size-4" />
            New truck
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
                placeholder="Search by number, manufacturer or owner"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <Combobox
              label="Filter by owner"
              hideLabel
              value={ownerFilter}
              onChange={(nextValue) => setOwnerFilter(nextValue)}
              options={[{ value: '', label: 'All owners' }, ...ownerOptions.map((owner) => ({ value: owner.id, label: owner.name }))]}
              placeholder="All owners"
              searchPlaceholder="Search owners…"
              className="w-48"
            />

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
        {someSelected ? (
          <div className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent/30 bg-accent/8 px-3.5 py-2.5">
            <p className="text-xs font-medium text-foreground">{selectedIds.size} selected</p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
              <Button type="button" size="sm" onClick={handleBulkStatusChange} disabled={bulkPending} className="accent-fill">
                {bulkPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {showInactive ? 'Mark active' : 'Mark inactive'}
              </Button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mx-5 mt-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="px-6 py-16 text-center">
            <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">Loading trucks…</p>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={TruckIcon} title="No trucks found" description="Try a different search or filter, or add a new truck." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="w-10 px-5 py-3">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={(value) => toggleAll(value === true)}
                      aria-label="Select all trucks"
                    />
                  </th>
                  <th className="px-5 py-3 font-semibold">Truck no</th>
                  <th className="px-5 py-3 font-semibold">Manufacturer</th>
                  <th className="px-5 py-3 font-semibold">Owner</th>
                  <th className="px-5 py-3 text-right font-semibold">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((truck) => (
                  <tr key={truck._id}>
                    <td className="px-5 py-4">
                      <Checkbox
                        checked={selectedIds.has(truck._id)}
                        onCheckedChange={(value) => toggleOne(truck._id, value === true)}
                        aria-label={`Select ${truck.truckNumber}`}
                      />
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{truck.truckNumber}</td>
                    <td className="px-5 py-4 text-muted-foreground">{truck.manufacturer}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {truck.owner ? `${truck.owner.name} (${truck.owner.phoneNumber})` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Link
                          to={truck._id}
                          state={{ editingTruck: truck }}
                          aria-label={`Edit ${truck.truckNumber}`}
                          title="Edit"
                          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                        >
                          <Pencil className="size-4" />
                        </Link>
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
