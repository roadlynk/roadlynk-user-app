import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Building2, ChevronLeft, ChevronRight, Loader2, Plus, Power, Search, UserPlus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StatusPill } from '@/components/shared/StatusPill'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { listCompanies, setCompanyActiveStatus } from '@/lib/company-service'
import { setSelectedCompany } from '@/store/slices/companySlice'
import { setCompaniesShowInactive } from '@/store/slices/uiPreferencesSlice'

const CLIENT_TYPE_FILTERS = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'SAAS', label: 'SaaS Client' },
]

const LIMIT = 20

export default function Companies({ onLogout }) {
  const dispatch = useDispatch()
  const showInactive = useSelector((state) => state.uiPreferences.companiesShowInactive)
  const [search, setSearch] = useState('')
  const [clientType, setClientType] = useState('STANDARD')
  const [page, setPage] = useState(1)
  const [companies, setCompanies] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const refreshCompanies = useCallback(async () => {
    setError(null)
    try {
      const response = await listCompanies({ active: !showInactive, page, limit: LIMIT })
      setCompanies(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (fetchError) {
      setError(fetchError.response?.data?.message ?? 'Unable to load companies.')
      setCompanies([])
      setTotal(0)
      setTotalPages(1)
    }
  }, [page, showInactive])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refreshCompanies().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshCompanies])

  const byType = useMemo(
    () => companies.filter((company) => (clientType === 'SAAS' ? company.isSaasClient : !company.isSaasClient)),
    [companies, clientType],
  )

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return byType
    return byType.filter((company) =>
      [company.companyName, company.companyCode, company.contactEmail, company.contactNumber, company.address?.town, company.address?.state]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    )
  }, [byType, search])

  async function toggleActive(company) {
    setTogglingId(company._id)
    setError(null)
    try {
      await setCompanyActiveStatus(company._id, !company.isActive)
      await refreshCompanies()
    } catch (toggleError) {
      setError(toggleError.response?.data?.message ?? 'Unable to update company status.')
    } finally {
      setTogglingId(null)
    }
  }

  function handleShowInactiveToggle() {
    dispatch(setCompaniesShowInactive(!showInactive))
    setPage(1)
  }

  return (
    <AppLayout onLogout={onLogout} eyebrow="Admin" title="Companies">
      <div className="mb-5 flex justify-end">
        <Button asChild className="accent-fill">
          <Link to="/companies/new">
            <Plus className="size-4" />
            New company
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/92 shadow-card backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="relative min-w-[14rem] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, code, contact or location"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div role="group" aria-label="Filter by client type" className="inline-flex rounded-md border border-border bg-secondary/50 p-1">
            {CLIENT_TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={clientType === filter.value}
                onClick={() => setClientType(filter.value)}
                className={cn(
                  'rounded-[5px] px-3 py-1.5 text-xs font-semibold transition-colors',
                  clientType === filter.value ? 'accent-fill shadow-accent' : 'text-muted-foreground hover:text-foreground',
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
              onClick={handleShowInactiveToggle}
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
        </div>

        {error ? (
          <p role="alert" className="mx-5 mt-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="px-6 py-16 text-center">
            <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">Loading companies…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Building2 className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">No company matches your search.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different name, code or location.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Company</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">GSTIN / PAN</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((company) => (
                  <tr key={company._id} className="align-middle">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{company.companyName}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="text-xs text-muted-foreground">{company.companyCode}</p>
                        {company.isSaasClient ? (
                          <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-accent">
                            SaaS
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <p>{company.contactEmail}</p>
                      <p className="text-xs">{company.contactNumber}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {[company.address?.town, company.address?.district, company.address?.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <p className="text-xs">{company.gstin}</p>
                      <p className="text-xs">{company.pan}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill active={company.isActive} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {!company.isSaasClient ? (
                          <Link
                            to={`/companies/${company._id}/users`}
                            onClick={() => dispatch(setSelectedCompany(company))}
                            aria-label={`Assign users to ${company.companyName}`}
                            title="Assign users"
                            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                          >
                            <UserPlus className="size-4" />
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => toggleActive(company)}
                          disabled={togglingId === company._id}
                          aria-label={`${company.isActive ? 'Disable' : 'Enable'} ${company.companyName}`}
                          title={company.isActive ? 'Disable company' : 'Enable company'}
                          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
                        >
                          {togglingId === company._id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Power className="size-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} &middot; {total} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
