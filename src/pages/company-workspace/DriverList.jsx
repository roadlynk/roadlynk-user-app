import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { IdCard, Loader2, Pencil, Plus, Power, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, TableShell } from '@/components/ui/form-kit'
import { cn } from '@/lib/utils'
import { listDriversApi, updateDriverActiveStatusApi } from '@/lib/driver-service'

export default function DriverList() {
  const { company } = useOutletContext()
  const companyId = company._id

  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const refreshDrivers = useCallback(async () => {
    setError(null)
    try {
      const response = await listDriversApi({ companyId, active: !showInactive })
      setDrivers(response ?? [])
    } catch (fetchError) {
      setError(fetchError.response?.data?.message ?? 'Unable to load drivers.')
      setDrivers([])
    }
  }, [companyId, showInactive])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refreshDrivers().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshDrivers])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return drivers
    return drivers.filter((driver) => [driver.name, driver.licenceNumber, driver.mobileNumber].filter(Boolean).some((value) => value.toLowerCase().includes(q)))
  }, [drivers, search])

  async function toggleActive(driver) {
    setTogglingId(driver._id)
    setError(null)
    try {
      await updateDriverActiveStatusApi(driver._id, { isActive: !driver.isActive })
      await refreshDrivers()
    } catch (toggleError) {
      setError(toggleError.response?.data?.message ?? 'Unable to update driver status.')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Drivers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Drivers onboarded to this company.</p>
        </div>
        <Button asChild className="accent-fill">
          <Link to="new">
            <Plus className="size-4" />
            New driver
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
                placeholder="Search by name, licence or mobile"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
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
            <p className="mt-3 text-sm text-muted-foreground">Loading drivers…</p>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={IdCard} title="No drivers found" description="Try a different search, or add a new driver." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Driver</th>
                  <th className="px-5 py-3 font-semibold">Mobile</th>
                  <th className="px-5 py-3 font-semibold">Licence number</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((driver) => (
                  <tr key={driver._id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{driver.name}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{driver.mobileNumber || '—'}</td>
                    <td className="px-5 py-4 text-muted-foreground">{driver.licenceNumber}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={driver._id}
                          state={{ editingDriver: driver }}
                          aria-label={`Edit ${driver.name}`}
                          title="Edit"
                          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleActive(driver)}
                          disabled={togglingId === driver._id}
                          aria-label={`${driver.isActive ? 'Disable' : 'Enable'} ${driver.name}`}
                          title={driver.isActive ? 'Disable driver' : 'Enable driver'}
                          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
                        >
                          {togglingId === driver._id ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
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
