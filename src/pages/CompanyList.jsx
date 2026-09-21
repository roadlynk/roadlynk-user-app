import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Building2, ChevronLeft, ChevronRight, Loader2, Search, Sparkles } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'
import { listCompanies } from '@/lib/company-service'
import { getCurrentUser } from '@/lib/auth-service'
import { ACCESS_ROLE, getAccessRole } from '@/lib/access-control'
import { setSelectedCompany } from '@/store/slices/companySlice'

const CLIENT_TYPE_FILTERS = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'SAAS', label: 'SaaS Client' },
]

const LIMIT = 20

export default function CompanyList({ onLogout }) {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const [clientType, setClientType] = useState('STANDARD')
  const [page, setPage] = useState(1)
  const [companies, setCompanies] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const canFilterByClientType = getAccessRole(getCurrentUser()) === ACCESS_ROLE.PROVIDER_ADMIN

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await listCompanies({ active: true, page, limit: LIMIT })
        if (cancelled) return
        setCompanies(response.data)
        setTotal(response.total)
        setTotalPages(response.totalPages)
      } catch (fetchError) {
        if (cancelled) return
        setError(fetchError.response?.data?.message ?? 'Unable to load companies.')
        setCompanies([])
        setTotal(0)
        setTotalPages(1)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [page])

  const byType = useMemo(
    () => companies.filter((company) => (clientType === 'SAAS' ? company.isSaasClient : !company.isSaasClient)),
    [companies, clientType],
  )

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return byType
    return byType.filter((company) =>
      [company.companyName, company.companyCode].filter(Boolean).some((value) => value.toLowerCase().includes(q)),
    )
  }, [byType, search])

  return (
    <AppLayout onLogout={onLogout} eyebrow="Onboarding" title="Company list">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search companies"
            className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm shadow-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        {canFilterByClientType ? (
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
        ) : null}

        <p className="text-xs text-muted-foreground">{rows.length} shown</p>
      </div>

      {error ? (
        <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">Loading companies…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <Building2 className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">No company matches your search.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different name, code or location.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((company) => (
            <li key={company._id}>
              <Link
                to={`/company-list/${company._id}`}
                onClick={() => dispatch(setSelectedCompany(company))}
                className="group flex flex-col gap-4 rounded-xl border border-border/70 bg-card/92 p-5 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={cn(
                      'grid size-12 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold',
                      company.isActive ? 'bg-accent/10 text-accent' : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {company.companyName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-foreground">{company.companyName}</p>
                    <p className="truncate text-xs uppercase tracking-[0.14em] text-muted-foreground">{company.companyCode}</p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
                  {company.isSaasClient ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-accent">
                      <Sparkles className="size-3" />
                      SaaS client
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-accent transition-colors group-hover:bg-accent/10">
                    Open workspace
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
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
      ) : null}
    </AppLayout>
  )
}
