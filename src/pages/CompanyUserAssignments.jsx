import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Building2, Check, ChevronDown, Loader2, Plus, Search, Users as UsersIcon, X } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toTitleCase } from '@/lib/format'
import { ASSIGNABLE_ROLES } from '@/lib/dummy-company-memberships'
import { fetchAssignUsersData, saveCompanyMemberships } from '@/lib/company-membership-service'

const MIN_SEARCH_CHARS = 2

// There's no GET /companies/:id endpoint, so the company clicked on the
// companies list is read from Redux (store/slices/companySlice.js, persisted).
export default function CompanyUserAssignments({ onLogout }) {
  const { companyId } = useParams()
  const selectedCompany = useSelector((state) => state.company.selectedCompany)
  const company = selectedCompany?._id === companyId ? selectedCompany : null

  const [usersByRole, setUsersByRole] = useState(null)
  const [assignedIds, setAssignedIds] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openRole, setOpenRole] = useState(null)
  const [search, setSearch] = useState({})
  const [recentlyAdded, setRecentlyAdded] = useState({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!company) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchAssignUsersData(companyId)
      .then((data) => {
        if (cancelled) return
        setUsersByRole(data.users ?? {})
        setAssignedIds(data.assignedUsers ?? {})
        setHasUnsavedChanges(false)
      })
      .catch((fetchError) => {
        if (cancelled) return
        setError(fetchError.response?.data?.message ?? 'Unable to load assignable users.')
        setUsersByRole({})
        setAssignedIds({})
        setHasUnsavedChanges(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [company, companyId])

  if (!company) {
    return (
      <AppLayout onLogout={onLogout} eyebrow="Admin" title="Assign users">
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <Building2 className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">We couldn&rsquo;t find that company.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/companies">
              <ArrowLeft className="size-4" />
              Back to companies
            </Link>
          </Button>
        </div>
      </AppLayout>
    )
  }

  function addUser(role, user) {
    setAssignedIds((prev) => ({
      ...prev,
      [role]: (prev[role] ?? []).includes(user._id) ? (prev[role] ?? []) : [...(prev[role] ?? []), user._id],
    }))
    setSearch((prev) => ({ ...prev, [role]: '' }))
    setRecentlyAdded((prev) => ({ ...prev, [role]: [...(prev[role] ?? []), user._id] }))
    setHasUnsavedChanges(true)
  }

  function removeUser(role, userId) {
    setAssignedIds((prev) => ({ ...prev, [role]: (prev[role] ?? []).filter((id) => id !== userId) }))
    setRecentlyAdded((prev) => ({ ...prev, [role]: (prev[role] ?? []).filter((id) => id !== userId) }))
    setHasUnsavedChanges(true)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const payload = Object.fromEntries(ASSIGNABLE_ROLES.map((role) => [role, assignedIds[role] ?? []]))
      await saveCompanyMemberships(companyId, payload)
      setRecentlyAdded({})
      setHasUnsavedChanges(false)
    } catch (submitError) {
      setSaveError(submitError?.response?.data?.message ?? 'Unable to save assignments. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout onLogout={onLogout} eyebrow="Admin" title={`Assign users — ${company.companyName}`}>
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button asChild variant="outline" size="icon" aria-label="Back to companies">
          <Link to="/companies">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs uppercase tracking-[0.14em] text-muted-foreground">{company.companyCode}</p>
          <h2 className="truncate font-display text-2xl font-semibold tracking-tight text-foreground">Assign users — {company.companyName}</h2>
        </div>
        {hasUnsavedChanges ? (
          <Button type="button" onClick={handleSave} disabled={saving} className="shrink-0 bg-green-600 text-white hover:bg-green-700">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Save
          </Button>
        ) : null}
      </div>

      {saveError ? (
        <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {saveError}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 grid h-40 place-items-center rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-accent" />
            Loading assignments…
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {ASSIGNABLE_ROLES.map((role) => {
            const pool = usersByRole?.[role] ?? []
            const assignedRoleIds = assignedIds[role] ?? []
            const assigned = pool.filter((user) => assignedRoleIds.includes(user._id))
            const term = (search[role] ?? '').trim().toLowerCase()
            const hasMinSearchChars = term.length >= MIN_SEARCH_CHARS
            const available = hasMinSearchChars
              ? pool
                  .filter((user) => !assignedRoleIds.includes(user._id))
                  .filter((user) => user.username.toLowerCase().includes(term) || user.email.toLowerCase().includes(term))
              : []
            const open = openRole === role

            return (
              <section key={role} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenRole(open ? null : role)}
                  className="flex w-full items-center justify-between gap-3 border-b border-border px-5 py-4 text-left transition-colors hover:bg-secondary/40"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                      {toTitleCase(role)}
                    </span>
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                      {assigned.length} assigned
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-xs font-semibold text-accent">
                    {open ? 'Close' : 'Add user'}
                    <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {open ? (
                  <div className="space-y-3 border-b border-border bg-secondary/30 px-5 py-4">
                    <label className="relative block">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={search[role] ?? ''}
                        onChange={(event) => setSearch({ ...search, [role]: event.target.value })}
                        placeholder={`Search a login to add as ${toTitleCase(role)}`}
                        className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </label>
                    <div className="max-h-64 divide-y divide-border overflow-y-auto rounded-md border border-border bg-card">
                      {!hasMinSearchChars ? (
                        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                          Type at least {MIN_SEARCH_CHARS} characters to search for a login.
                        </p>
                      ) : available.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No matching login is available. Create one under Users &amp; Roles.
                        </p>
                      ) : (
                        available.map((user) => (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => addUser(role, user)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
                          >
                            <span>
                              <span className="block font-medium text-foreground">{user.username}</span>
                              <span className="block text-xs text-muted-foreground">{user.email}</span>
                              {user.employeeRoles?.length > 1 ? (
                                <span className="mt-1 flex flex-wrap gap-1">
                                  {user.employeeRoles.map((eligibleRole) => (
                                    <span
                                      key={eligibleRole}
                                      className="rounded-full border border-border px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground"
                                    >
                                      {toTitleCase(eligibleRole)}
                                    </span>
                                  ))}
                                </span>
                              ) : null}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                              <Plus className="size-4" />
                              Add
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="divide-y divide-border">
                  {assigned.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <UsersIcon className="mx-auto size-7 text-muted-foreground/50" />
                      <p className="mt-3 text-sm text-muted-foreground">No login is assigned as {toTitleCase(role)} for this company yet.</p>
                    </div>
                  ) : (
                    assigned.map((user) => {
                      const justAdded = recentlyAdded[role]?.includes(user._id)
                      return (
                        <div
                          key={user._id}
                          className={cn(
                            'flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors',
                            justAdded && 'bg-green-500/10',
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <div>
                              <p className="font-medium text-foreground">{user.username}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            {justAdded ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                                <Check className="size-3" />
                                Added
                              </span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUser(role, user._id)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                          >
                            <X className="size-4" />
                            Remove
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
