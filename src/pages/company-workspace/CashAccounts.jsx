import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CheckCircle2, Landmark, Loader2, MapPinned, Plus, Search, Wallet, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { EmptyState, FormSection, SelectField } from '@/components/ui/form-kit'
import { CASH_ACCOUNT_TYPE, createCashAccountApi, listCashAccountsApi } from '@/lib/cash-account-service'
import { listClientsApi } from '@/lib/client-service'
import { filterAccountAssignmentsApi, saveAccountAssignmentApi } from '@/lib/account-assign-service'

const TYPE_META = {
  [CASH_ACCOUNT_TYPE.PETTY_CASH]: { label: 'Petty cash', icon: Wallet },
  [CASH_ACCOUNT_TYPE.ADJUSTMENT]: { label: 'Adjustment', icon: Wrench },
}

const TYPE_OPTIONS = [
  { value: CASH_ACCOUNT_TYPE.PETTY_CASH, label: 'Petty cash' },
  { value: CASH_ACCOUNT_TYPE.ADJUSTMENT, label: 'Adjustment' },
]

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function AccountGroup({ type, rows, search, justCreatedId }) {
  const meta = TYPE_META[type]
  const Icon = meta.icon

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-accent" />
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground">{meta.label}</h3>
        <span className="text-xs text-muted-foreground">
          {rows.length} account{rows.length === 1 ? '' : 's'}
        </span>
      </div>

      {rows.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((account) => (
            <div
              key={account._id}
              className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card/92 px-4 py-3.5 shadow-card backdrop-blur-xl transition-colors hover:border-accent/40"
            >
              <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{account.name}</p>
                <p className="mt-0.5 text-[0.7rem] text-muted-foreground">Added {formatDate(account.createdAt)}</p>
              </div>
              {account._id === justCreatedId ? <CheckCircle2 className="size-4 shrink-0 text-accent" /> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
          {search ? 'No accounts match your search.' : `No ${meta.label.toLowerCase()} accounts yet.`}
        </p>
      )}
    </div>
  )
}

export default function CashAccounts() {
  const { company } = useOutletContext()
  const companyId = company._id

  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [search, setSearch] = useState('')

  const [creating, setCreating] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftType, setDraftType] = useState(CASH_ACCOUNT_TYPE.PETTY_CASH)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [justCreatedId, setJustCreatedId] = useState(null)

  const refreshAccounts = useCallback(async () => {
    setListError(null)
    try {
      const response = await listCashAccountsApi({ companyId, active: true })
      setAccounts(response ?? [])
    } catch (fetchError) {
      setListError(fetchError.response?.data?.message ?? 'Unable to load accounts.')
    }
  }, [companyId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refreshAccounts().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshAccounts])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const sorted = [...accounts].sort((a, b) => a.name.localeCompare(b.name))
    if (!q) return sorted
    return sorted.filter((account) => account.name.toLowerCase().includes(q))
  }, [accounts, search])

  const pettyCashRows = rows.filter((account) => account.type === CASH_ACCOUNT_TYPE.PETTY_CASH)
  const adjustmentRows = rows.filter((account) => account.type === CASH_ACCOUNT_TYPE.ADJUSTMENT)

  function startCreate() {
    setCreating(true)
    setDraftName('')
    setDraftType(CASH_ACCOUNT_TYPE.PETTY_CASH)
    setFormError(null)
  }

  function cancelCreate() {
    setCreating(false)
    setDraftName('')
    setFormError(null)
  }

  async function handleCreate(event) {
    event.preventDefault()
    setFormError(null)
    const name = draftName.trim()
    if (!name) {
      setFormError('Account name is required.')
      return
    }
    if (accounts.some((account) => account.name.toLowerCase() === name.toLowerCase())) {
      setFormError('An account with this name already exists.')
      return
    }

    setSaving(true)
    try {
      const created = await createCashAccountApi({ companyId, name, type: draftType })
      await refreshAccounts()
      setJustCreatedId(created?._id ?? null)
      cancelCreate()
    } catch (submitError) {
      setFormError(submitError.response?.data?.message ?? 'Unable to create this account.')
    } finally {
      setSaving(false)
    }
  }

  // --- Account assignment: pick a consignor + branch, then assign one of
  // the accounts above to that combination. ---
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [clientsError, setClientsError] = useState(null)
  const [consignorId, setConsignorId] = useState('')
  const [consignorBranchId, setConsignorBranchId] = useState('')

  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [assignmentError, setAssignmentError] = useState(null)
  const [assignedAccountId, setAssignedAccountId] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [assignmentSaving, setAssignmentSaving] = useState(false)
  const [assignmentSaveError, setAssignmentSaveError] = useState(null)
  const [assignmentSaved, setAssignmentSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoadingClients(true)
    listClientsApi({ companyId, active: true })
      .then((response) => {
        if (cancelled) return
        setClients(response ?? [])
      })
      .catch((fetchError) => {
        if (cancelled) return
        setClientsError(fetchError.response?.data?.message ?? 'Unable to load clients.')
      })
      .finally(() => {
        if (!cancelled) setLoadingClients(false)
      })
    return () => {
      cancelled = true
    }
  }, [companyId])

  const consignor = clients.find((client) => client._id === consignorId) ?? null
  const consignorBranches = (consignor?.branches ?? []).filter((branch) => branch.isActive)
  const clientOptions = clients.map((client) => ({ value: client._id, label: `${client.name} (${client.clientCode})` }))
  const accountOptions = accounts.map((account) => ({ value: account._id, label: `${account.name} (${TYPE_META[account.type].label})` }))
  const assignmentSelectionComplete = Boolean(consignorId && consignorBranchId)

  useEffect(() => {
    setAssignedAccountId('')
    setSelectedAccountId('')
    setAssignmentError(null)
    setAssignmentSaveError(null)
    setAssignmentSaved(false)

    if (!assignmentSelectionComplete) return

    let cancelled = false
    setAssignmentLoading(true)

    filterAccountAssignmentsApi({ companyId, consignorId, consignorBranchId })
      .then((response) => {
        if (cancelled) return
        const accountId = response?.[0]?.accountId?._id ?? ''
        setAssignedAccountId(accountId)
        setSelectedAccountId(accountId)
      })
      .catch((fetchError) => {
        if (cancelled) return
        setAssignmentError(fetchError.response?.data?.message ?? 'Unable to load the assigned account.')
      })
      .finally(() => {
        if (!cancelled) setAssignmentLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [assignmentSelectionComplete, companyId, consignorId, consignorBranchId])

  const assignmentDirty = selectedAccountId !== assignedAccountId

  async function handleSaveAssignment() {
    setAssignmentSaveError(null)
    setAssignmentSaving(true)
    try {
      await saveAccountAssignmentApi({ companyId, consignorId, consignorBranchId, accountId: selectedAccountId })
      setAssignedAccountId(selectedAccountId)
      setAssignmentSaved(true)
    } catch (submitError) {
      setAssignmentSaveError(submitError.response?.data?.message ?? 'Unable to save this assignment.')
    } finally {
      setAssignmentSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Cash accounts configured for this company.</p>
        </div>
        <Button type="button" onClick={startCreate} className="accent-fill">
          <Plus className="size-4" />
          Create account
        </Button>
      </div>

      {creating ? (
        <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Account name" required value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="e.g. MST Sattur" />
            <SelectField label="Type" required value={draftType} onChange={(event) => setDraftType(event.target.value)} options={TYPE_OPTIONS} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelCreate}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="accent-fill">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Create account
            </Button>
          </div>
          {formError ? <p className="text-xs text-destructive">{formError}</p> : null}
        </form>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search accounts…"
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {search ? `${rows.length} of ${accounts.length} accounts` : `${accounts.length} account${accounts.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {listError ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {listError}
        </p>
      ) : loading ? (
        <div className="rounded-lg border border-border/70 px-4 py-16 text-center">
          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">Loading accounts…</p>
        </div>
      ) : rows.length > 0 ? (
        <div className="space-y-8">
          <AccountGroup type={CASH_ACCOUNT_TYPE.PETTY_CASH} rows={pettyCashRows} search={search} justCreatedId={justCreatedId} />
          <AccountGroup type={CASH_ACCOUNT_TYPE.ADJUSTMENT} rows={adjustmentRows} search={search} justCreatedId={justCreatedId} />
        </div>
      ) : (
        <div className="rounded-xl border border-border/70 bg-card/92 shadow-card backdrop-blur-xl">
          <EmptyState
            icon={search ? Search : Landmark}
            title={search ? 'No accounts match your search.' : 'No accounts added yet.'}
            description={search ? undefined : 'Create your first cash account to get started.'}
          />
        </div>
      )}

      <div className="border-t border-border pt-5">
        <div className="mb-4 flex items-center gap-2">
          <MapPinned className="size-4 text-accent" />
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">Account assignment</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Assign a cash account to a consignor's branch.</p>

        {clientsError ? (
          <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {clientsError}
          </p>
        ) : null}

        <div className="space-y-8 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <FormSection title="Consignor">
            <SelectField
              label="Consignor"
              required
              value={consignorId}
              onChange={(event) => {
                setConsignorId(event.target.value)
                setConsignorBranchId('')
              }}
              options={clientOptions}
              placeholder={loadingClients ? 'Loading clients…' : 'Select consignor'}
              disabled={loadingClients}
            />
            <SelectField
              label="Consignor branch"
              required
              value={consignorBranchId}
              onChange={(event) => setConsignorBranchId(event.target.value)}
              options={consignorBranches.map((branch) => ({ value: branch._id, label: branch.branchName }))}
              placeholder={consignorId ? 'Select branch' : 'Select a consignor first'}
              disabled={!consignorId}
            />
          </FormSection>
        </div>

        {!assignmentSelectionComplete ? (
          <p className="mt-4 rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
            Select the consignor and branch to manage its account assignment.
          </p>
        ) : assignmentLoading ? (
          <div className="mt-4 rounded-lg border border-border/70 px-4 py-6 text-center">
            <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">Loading assignment…</p>
          </div>
        ) : assignmentError ? (
          <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {assignmentError}
          </p>
        ) : (
          <div className="mt-4 space-y-4 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
            <SelectField
              label="Account"
              value={selectedAccountId}
              onChange={(event) => {
                setSelectedAccountId(event.target.value)
                setAssignmentSaved(false)
              }}
              options={accountOptions}
              placeholder={accountOptions.length === 0 ? 'No accounts available — create one above' : 'Select account'}
              disabled={accountOptions.length === 0}
            />

            {assignmentSaveError ? <p className="text-xs text-destructive">{assignmentSaveError}</p> : null}

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              {assignmentSaved && !assignmentDirty ? (
                <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
                  <CheckCircle2 className="size-3.5" />
                  Saved
                </p>
              ) : null}
              <Button
                type="button"
                onClick={handleSaveAssignment}
                disabled={assignmentSaving || !assignmentDirty || !selectedAccountId}
                className="accent-fill"
              >
                {assignmentSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                Save assignment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
