import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2, Pencil, Plus, Power, Search, ShieldCheck, Users as UsersIcon } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StatusPill } from '@/components/shared/StatusPill'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toTitleCase } from '@/lib/format'
import { getCurrentUser } from '@/lib/auth-service'
import { ACCESS_ROLE, getAccessRole } from '@/lib/access-control'
import { fetchUsersForAdmin } from '@/lib/user-admin-service'
import { setUserActiveStatus } from '@/lib/user-service'
import { setUsersShowInactive } from '@/store/slices/uiPreferencesSlice'

export default function Users({ onLogout }) {
  const dispatch = useDispatch()
  const showInactive = useSelector((state) => state.uiPreferences.usersShowInactive)
  const currentUser = getCurrentUser()
  const accessRole = getAccessRole(currentUser)
  // PROVIDER_ADMIN / PROVIDER_SUPER_ADMIN see every company; everyone else (CLIENT_ADMIN)
  // is scoped to their own company, taken from their login response.
  const isProviderLevel = accessRole === ACCESS_ROLE.PROVIDER_ADMIN || accessRole === ACCESS_ROLE.PROVIDER_SUPER_ADMIN
  const companyId = isProviderLevel ? undefined : currentUser?.companies?.[0]?.id
  const adminLabel = isProviderLevel ? 'Client Admin' : 'Admin'
  const newAdminLabel = `New ${adminLabel}`
  const roleFilters = [
    { value: 'admin', label: adminLabel },
    { value: 'employee', label: 'Employee' },
  ]

  const [search, setSearch] = useState('')
  const [bucket, setBucket] = useState('admin')
  const [data, setData] = useState({ employee: [], admin: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const refreshUsers = useCallback(async () => {
    setError(null)
    try {
      const response = await fetchUsersForAdmin({ active: !showInactive, companyId })
      setData({ employee: response.employee ?? [], admin: response.admin ?? [] })
    } catch (fetchError) {
      setError(fetchError.response?.data?.message ?? 'Unable to load users.')
      setData({ employee: [], admin: [] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive, companyId, isProviderLevel])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refreshUsers().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshUsers])

  const rows = useMemo(() => {
    const list = data[bucket] ?? []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((user) =>
      [user.username, user.email, user.companies?.[0]?.companyName, ...(user.employeeRoles ?? [])]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    )
  }, [data, bucket, search])

  async function toggleActive(user) {
    setTogglingId(user._id)
    setError(null)
    try {
      // A client user (Client Admin / client employee) always needs the company
      // they belong to, whoever performs the toggle — the backend rejects it
      // otherwise ("Company ID is required for client users"). Provider
      // employees have no company, so a provider-level actor omits it there.
      const userCompany = user.companies?.[0]
      const userCompanyId = userCompany?.id ?? userCompany?._id ?? userCompany?.companyId
      const isClientUser = user.userCompanyType === 'CLIENT' || Boolean(userCompanyId)
      const scopedCompanyId = isClientUser ? (userCompanyId ?? companyId) : isProviderLevel ? undefined : companyId
      await setUserActiveStatus(user._id, !user.isActive, scopedCompanyId)
      await refreshUsers()
    } catch (toggleError) {
      setError(toggleError.response?.data?.message ?? 'Unable to update login status.')
    } finally {
      setTogglingId(null)
    }
  }

  const editPath = bucket === 'admin' ? '/users/new-saas-admin' : '/users/new-employee'

  return (
    <AppLayout onLogout={onLogout} eyebrow="Admin" title="Users & Roles">
      <div className="mb-5 flex flex-wrap justify-end gap-3">
        <Button asChild className="accent-fill">
          <Link to="/users/new-saas-admin">
            <ShieldCheck className="size-4" />
            {newAdminLabel}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/users/new-employee">
            <Plus className="size-4" />
            New employee
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
              placeholder="Search by name, email, company or role"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div role="group" aria-label="Filter by role" className="inline-flex rounded-md border border-border bg-secondary/50 p-1">
            {roleFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={bucket === filter.value}
                onClick={() => setBucket(filter.value)}
                className={cn(
                  'rounded-[5px] px-3 py-1.5 text-xs font-semibold transition-colors',
                  bucket === filter.value ? 'accent-fill shadow-accent' : 'text-muted-foreground hover:text-foreground',
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
              onClick={() => dispatch(setUsersShowInactive(!showInactive))}
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
            <p className="mt-3 text-sm text-muted-foreground">Loading users…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <UsersIcon className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">No logins match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Company</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((user) => {
                  const company = user.companies?.[0]
                  return (
                    <tr key={user._id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{company?.companyName ?? 'Not assigned'}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {bucket === 'admin'
                          ? adminLabel
                          : user.employeeRoles?.length
                            ? user.employeeRoles.map((role) => toTitleCase(role)).join(', ')
                            : 'Employee'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill active={user.isActive} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={editPath}
                            state={{ editingUser: user }}
                            aria-label={`Edit ${user.username}`}
                            title="Edit"
                            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleActive(user)}
                            disabled={togglingId === user._id}
                            aria-label={`${user.isActive ? 'Disable' : 'Enable'} ${user.username}`}
                            title={user.isActive ? 'Disable login' : 'Enable login'}
                            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
                          >
                            {togglingId === user._id ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
