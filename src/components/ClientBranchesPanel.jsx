import { useMemo, useState } from 'react'
import { ChevronDown, Loader2, Pencil, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { AddressFields } from '@/components/dc/AddressFields'
import { EMPTY_DC_ADDRESS, addressSummary, fromAddressPayload, toAddressPayload, validateAddressValue } from '@/lib/address-format'
import { cn } from '@/lib/utils'
import { createClientBranchApi, updateClientBranchActiveStatusApi, updateClientBranchApi } from '@/lib/client-branch-service'
import { listClientsApi } from '@/lib/client-service'

const EMPTY_DRAFT = { branchName: '', address: EMPTY_DC_ADDRESS }

/** Lists and manages the branches of a single client. */
export function ClientBranchesPanel({ client }) {
  const [expanded, setExpanded] = useState(true)
  const [search, setSearch] = useState('')
  const [branches, setBranches] = useState(client.branches ?? [])
  const [listError, setListError] = useState(null)

  // null = form closed, 'new' = adding, otherwise the branch _id being edited.
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return branches
    return branches.filter((branch) => branch.branchName.toLowerCase().includes(q))
  }, [branches, search])

  async function refreshBranches() {
    setListError(null)
    try {
      const response = await listClientsApi({ companyId: client.companyId })
      const updated = response?.find((item) => item._id === client._id)
      setBranches(updated?.branches ?? [])
    } catch (fetchError) {
      setListError(fetchError.response?.data?.message ?? 'Unable to refresh branches.')
    }
  }

  function startAdd() {
    setEditingId('new')
    setDraft(EMPTY_DRAFT)
    setFormError(null)
  }

  function startEdit(branch) {
    setEditingId(branch._id)
    setDraft({ branchName: branch.branchName, address: fromAddressPayload(branch.address) })
    setFormError(null)
  }

  function cancelForm() {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
    setFormError(null)
  }

  async function handleSave() {
    setFormError(null)
    const branchName = draft.branchName.trim()
    if (!branchName) {
      setFormError('Branch name is required.')
      return
    }

    const addressError = validateAddressValue(draft.address)
    if (addressError) {
      setFormError(addressError)
      return
    }

    const payload = { branchName, clientId: client._id, address: toAddressPayload(draft.address) }

    setSaving(true)
    try {
      if (editingId === 'new') {
        await createClientBranchApi(payload)
      } else {
        await updateClientBranchApi(editingId, payload)
      }
      await refreshBranches()
      cancelForm()
    } catch (submitError) {
      setFormError(submitError.response?.data?.message ?? 'Unable to save this branch.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(branch) {
    setListError(null)
    setTogglingId(branch._id)
    try {
      await updateClientBranchActiveStatusApi(branch._id, { isActive: !branch.isActive })
      await refreshBranches()
    } catch (toggleError) {
      setListError(toggleError.response?.data?.message ?? 'Unable to update this branch.')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Branches</h3>
          <p className="mt-1 text-xs text-muted-foreground">Branches for this client.</p>
        </div>
        <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200', expanded ? 'rotate-180' : '')} />
      </button>

      {expanded ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search branches"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <Button type="button" variant="outline" onClick={startAdd}>
              <Plus className="size-4" />
              Add branch
            </Button>
          </div>

          {listError ? (
            <p role="alert" className="text-xs text-destructive">
              {listError}
            </p>
          ) : null}

          {editingId ? (
            <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
              <TextField
                label="Branch name"
                required
                value={draft.branchName}
                onChange={(event) => setDraft((prev) => ({ ...prev, branchName: event.target.value }))}
              />

              <AddressFields
                title="Branch address"
                value={draft.address}
                onChange={(next) => setDraft((prev) => ({ ...prev, address: next }))}
              />

              {formError ? <p className="text-xs text-destructive">{formError}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={cancelForm}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {editingId === 'new' ? 'Add branch' : 'Save changes'}
                </Button>
              </div>
            </div>
          ) : null}

          {rows.length > 0 ? (
            <ul className="divide-y divide-border rounded-lg border border-border/70">
              {rows.map((branch) => (
                <li key={branch._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{branch.branchName}</p>
                    <p className="truncate text-xs text-muted-foreground">{addressSummary(branch.address)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {branch.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-accent">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        Inactive
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(branch)}
                      aria-label={`Edit ${branch.branchName}`}
                      title="Edit"
                      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleToggle(branch)} disabled={togglingId === branch._id}>
                      {togglingId === branch._id ? <Loader2 className="size-3.5 animate-spin" /> : null}
                      {branch.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
              {branches.length === 0 ? 'No branches added yet.' : 'No branches match your search.'}
            </p>
          )}
        </>
      ) : null}
    </section>
  )
}
