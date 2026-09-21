import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, ShieldCheck, TriangleAlert, Users } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StatusPill } from '@/components/shared/StatusPill'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { PasswordField, TextField } from '@/components/ui/text-field'
import { cn } from '@/lib/utils'
import { toTitleCase } from '@/lib/format'
import { listSaasClientCompanies } from '@/lib/company-service'
import { createUser, updateEmployeeRoles } from '@/lib/user-service'
import { getCurrentUser } from '@/lib/auth-service'
import { ACCESS_ROLE, getAccessRole } from '@/lib/access-control'

const EMPLOYEE_ROLES = ['MANAGER', 'AUDITOR']

export default function UserCreate({ kind, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSaasAdmin = kind === 'saas-admin'
  const editingUser = location.state?.editingUser ?? null
  const isEditing = Boolean(editingUser)
  const currentUser = getCurrentUser()
  const accessRole = getAccessRole(currentUser)
  const isProviderLevel = accessRole === ACCESS_ROLE.PROVIDER_ADMIN || accessRole === ACCESS_ROLE.PROVIDER_SUPER_ADMIN
  const isClientAdmin = accessRole === ACCESS_ROLE.CLIENT_ADMIN
  const adminLabel = isProviderLevel ? 'Client Admin' : 'Admin'
  const ownCompany = currentUser?.companies?.[0] ?? null

  const [form, setForm] = useState(() => {
    const company = editingUser?.companies?.[0]
    return {
      username: editingUser?.username ?? '',
      email: editingUser?.email ?? '',
      password: '',
      companyId: company?.id ?? (isClientAdmin ? (ownCompany?.id ?? '') : ''),
      employeeRoles: editingUser?.employeeRoles ?? (company?.employeeRole ? [company.employeeRole] : []),
    }
  })
  // Captured once from the record being edited, so it stays fixed while the
  // user toggles checkboxes — the diff against it is what becomes removedRoles.
  const initialEmployeeRoles = editingUser?.employeeRoles ?? []

  const [error, setError] = useState(null)
  const [roleUpdateError, setRoleUpdateError] = useState(null)
  const [pending, setPending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Company dropdown is only relevant for PROVIDER_ADMIN / PROVIDER_SUPER_ADMIN,
  // who can tag any client company. CLIENT_ADMIN already knows their own company
  // from their login session — no API call needed for that case.
  const [companies, setCompanies] = useState([])
  const [companiesLoading, setCompaniesLoading] = useState(isSaasAdmin && isProviderLevel)

  useEffect(() => {
    if (!isSaasAdmin || !isProviderLevel) return
    let cancelled = false
    setCompaniesLoading(true)
    listSaasClientCompanies()
      .then((response) => {
        if (cancelled) return
        setCompanies(response ?? [])
      })
      .catch(() => {
        // Leave companies empty — the combobox below already handles an
        // empty options list.
      })
      .finally(() => {
        if (!cancelled) setCompaniesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isSaasAdmin, isProviderLevel])

  const companyOptions = companies.map((company) => ({
    value: company._id,
    label: `${company.companyName} (${company.companyCode})`,
  }))
  const selectedCompany = companies.find((company) => company._id === form.companyId) ?? null

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!form.username.trim() || !form.email.trim() || (!isEditing && !form.password)) {
      setError(isEditing ? 'Fill in username and email.' : 'Fill in username, email and a temporary password.')
      return
    }
    if (isSaasAdmin && !form.companyId) {
      setError('Please tag exactly one company for this login.')
      return
    }
    if (!isSaasAdmin && form.employeeRoles.length === 0) {
      setError('Pick at least one role for this employee.')
      return
    }

    // Client Admin creation and employee creation (by any admin) have real
    // backend endpoints. Only editing an existing login still falls back to
    // a demo-only delay below.
    if (isSaasAdmin && !isEditing) {
      setPending(true)
      try {
        await createUser({
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          userCompanyType: 'CLIENT',
          userRole: 'ADMIN',
          companyId: form.companyId,
        })
        navigate('/users')
      } catch (submitError) {
        setPending(false)
        setError(submitError.response?.data?.message ?? 'Unable to create the login. Please try again.')
      }
      return
    }

    if (!isSaasAdmin && !isEditing && (isProviderLevel || isClientAdmin)) {
      setPending(true)
      try {
        await createUser({
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          userCompanyType: isProviderLevel ? 'PROVIDER' : 'CLIENT',
          userRole: 'EMPLOYEE',
          employeeRoles: form.employeeRoles,
          // A CLIENT_ADMIN's employees belong to their own company — taken
          // from their login session, the same source used to pre-fill the
          // disabled company field in the admin-creation flow above.
          ...(isClientAdmin ? { companyId: ownCompany?.id } : {}),
        })
        navigate('/users')
      } catch (submitError) {
        setPending(false)
        setError(submitError.response?.data?.message ?? 'Unable to create the login. Please try again.')
      }
      return
    }

    if (!isSaasAdmin && isEditing) {
      const userId = editingUser?._id ?? editingUser?.id
      // removedRoles tells the backend which role(s) were dropped so it can
      // validate they aren't still held via an active company membership
      // (rejecting with API30003 if so) — computed the same way for both a
      // PROVIDER employee edit and a CLIENT employee edit.
      const removedRoles = initialEmployeeRoles.filter((role) => !form.employeeRoles.includes(role))
      const payload = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        employeeRoles: form.employeeRoles,
        removedRoles,
      }
      if (form.password) payload.password = form.password
      // A CLIENT employee is additionally scoped to one company.
      if (isClientAdmin) payload.companyId = ownCompany?.id

      setPending(true)
      try {
        await updateEmployeeRoles(userId, payload)
        navigate('/users')
      } catch (submitError) {
        setPending(false)
        setRoleUpdateError(submitError.response?.data?.message ?? 'Unable to update this employee.')
      }
      return
    }

    // isSaasAdmin && isEditing: editing a Client Admin / Admin. Same endpoint
    // as an employee edit, but admins have no roles — employeeRoles and
    // removedRoles are both omitted entirely.
    const userId = editingUser?._id ?? editingUser?.id
    const payload = {
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      companyId: form.companyId,
    }
    if (form.password) payload.password = form.password

    setPending(true)
    try {
      await updateEmployeeRoles(userId, payload)
      navigate('/users')
    } catch (submitError) {
      setPending(false)
      setRoleUpdateError(submitError.response?.data?.message ?? 'Unable to update this login.')
    }
  }

  const roleTypeLabel = isSaasAdmin ? adminLabel : 'employee'
  const pageTitle = `${isEditing ? 'Edit' : 'New'} ${roleTypeLabel}`
  const pageHeading = isEditing ? `Edit ${roleTypeLabel}` : `Create ${isSaasAdmin ? 'a' : 'an'} ${roleTypeLabel}`

  return (
    <AppLayout onLogout={onLogout} eyebrow="Admin" title={pageTitle}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Button asChild variant="outline" size="icon" aria-label="Back to users">
            <Link to="/users">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">{pageHeading}</h2>
        </div>

        <div className="space-y-8 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Login details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Username"
                required
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              <PasswordField
                label={isEditing ? 'New password' : 'Temporary password'}
                required={!isEditing}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                helperText={isEditing ? 'Leave blank to keep the current password.' : undefined}
                className="sm:col-span-2"
              />
            </div>
          </section>

          {isSaasAdmin ? (
            <section className="space-y-4">
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Organisation tagging</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isEditing
                    ? 'The tagged company cannot be changed once a login is created.'
                    : `Exactly one company can be tagged to a ${adminLabel} login.`}
                </p>
              </div>

              {isClientAdmin ? (
                <TextField label="Company" value={ownCompany?.companyName ?? ''} disabled className="sm:max-w-sm" />
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Combobox
                      label="Company"
                      placeholder={companiesLoading ? 'Loading companies…' : 'Select one company'}
                      searchPlaceholder="Search companies…"
                      value={form.companyId}
                      onChange={(value) => {
                        setForm({ ...form, companyId: value })
                        setShowPreview(false)
                      }}
                      options={companyOptions}
                      disabled={companiesLoading || isEditing}
                    />
                    <div className="flex items-end">
                      <Button type="button" variant="outline" disabled={!selectedCompany} onClick={() => setShowPreview((value) => !value)}>
                        <ShieldCheck className="size-4" />
                        {showPreview ? 'Hide company details' : 'Preview company'}
                      </Button>
                    </div>
                  </div>
                  {selectedCompany && showPreview ? (
                    <div className="rounded-lg border border-border bg-secondary/40 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-display text-base font-semibold text-foreground">{selectedCompany.companyName}</p>
                        <StatusPill active={selectedCompany.isActive} />
                      </div>
                      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                        {[
                          ['Company code', selectedCompany.companyCode],
                          ['PAN', selectedCompany.pan],
                          ['GSTIN', selectedCompany.gstin],
                          ['Address', selectedCompany.address?.fullAddress],
                          ['City / State', [selectedCompany.address?.town, selectedCompany.address?.state].filter(Boolean).join(', ')],
                          ['Email', selectedCompany.contactEmail],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
                            <dd className="mt-1 text-sm font-medium text-foreground">{value || '—'}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          ) : (
            <section className="space-y-4">
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Role</h3>
              <div className="flex flex-wrap gap-2">
                {EMPLOYEE_ROLES.map((role) => {
                  const on = form.employeeRoles.includes(role)
                  return (
                    <button
                      key={role}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          employeeRoles: prev.employeeRoles.includes(role)
                            ? prev.employeeRoles.filter((existing) => existing !== role)
                            : [...prev.employeeRoles, role],
                        }))
                      }
                      className={cn(
                        'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors',
                        on
                          ? 'border-accent/50 bg-accent/10 text-accent'
                          : 'border-border text-muted-foreground hover:border-accent/40 hover:text-accent',
                      )}
                    >
                      <Users className="size-3.5" />
                      {toTitleCase(role)}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">Pick one or more access levels for this employee.</p>
            </section>
          )}
        </div>

        {error ? (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/users')}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending} className="accent-fill">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isEditing ? 'Save changes' : 'Create login'}
          </Button>
        </div>
      </form>

      {roleUpdateError ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setRoleUpdateError(null)} />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="role-update-error-title"
            className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lift"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="size-4" />
              </span>
              <div className="min-w-0">
                <h3 id="role-update-error-title" className="font-display text-sm font-semibold text-foreground">
                  Couldn&rsquo;t update employee
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{roleUpdateError}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button type="button" onClick={() => setRoleUpdateError(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  )
}
