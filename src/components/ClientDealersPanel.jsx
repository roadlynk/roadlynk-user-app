import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Loader2, Pencil, Plus, Power, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { AddressFields } from '@/components/dc/AddressFields'
import { EMPTY_DC_ADDRESS, addressSummary, fromAddressPayload, toAddressPayload, validateAddressValue } from '@/lib/address-format'
import { createDealerApi, listDealersApi, updateDealerActiveStatusApi, updateDealerApi } from '@/lib/dealer-service'
import { cn } from '@/lib/utils'

const EMPTY_DRAFT = { dealerName: '', dealerCode: '', address: EMPTY_DC_ADDRESS }

export function ClientDealersPanel({ client }) {
  const [expanded, setExpanded] = useState(true)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  // null = form closed, 'new' = adding, otherwise the dealer _id being edited.
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const refreshDealers = useCallback(async () => {
    setListError(null)
    try {
      const response = await listDealersApi({ clientId: client._id, active: !showInactive })
      setDealers(response ?? [])
    } catch (fetchError) {
      setListError(fetchError.response?.data?.message ?? 'Unable to load dealers.')
      setDealers([])
    }
  }, [client._id, showInactive])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refreshDealers().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshDealers])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return dealers
    return dealers.filter((dealer) => [dealer.dealerName, dealer.code].some((value) => value.toLowerCase().includes(q)))
  }, [dealers, search])

  function startAdd() {
    setEditingId('new')
    setDraft(EMPTY_DRAFT)
    setFormError(null)
  }

  function startEdit(dealer) {
    setEditingId(dealer._id)
    setDraft({ dealerName: dealer.dealerName, dealerCode: dealer.code, address: fromAddressPayload(dealer.address) })
    setFormError(null)
  }

  function cancelForm() {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
    setFormError(null)
  }

  async function handleSave() {
    setFormError(null)
    if (!draft.dealerName.trim() || !draft.dealerCode.trim()) {
      setFormError('Dealer name and dealer code are required.')
      return
    }

    const addressError = validateAddressValue(draft.address)
    if (addressError) {
      setFormError(addressError)
      return
    }

    const payload = {
      clientId: client._id,
      dealerName: draft.dealerName.trim(),
      code: draft.dealerCode.trim().toUpperCase(),
      address: toAddressPayload(draft.address),
    }

    setSaving(true)
    try {
      if (editingId === 'new') {
        await createDealerApi(payload)
      } else {
        await updateDealerApi(editingId, payload)
      }
      await refreshDealers()
      cancelForm()
    } catch (submitError) {
      setFormError(submitError.response?.data?.message ?? 'Unable to save this dealer.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(dealer) {
    const nextIsActive = !dealer.isActive
    setTogglingId(dealer._id)
    setListError(null)
    try {
      await updateDealerActiveStatusApi(dealer._id, { isActive: nextIsActive })
      await refreshDealers()
    } catch (toggleError) {
      setListError(toggleError.response?.data?.message ?? 'Unable to update this dealer.')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Dealers</h3>
          <p className="mt-1 text-xs text-muted-foreground">Dealers for this client.</p>
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
                placeholder="Search dealers"
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

            <Button type="button" variant="outline" onClick={startAdd}>
              <Plus className="size-4" />
              Add dealer
            </Button>
          </div>

          {listError ? (
            <p role="alert" className="text-xs text-destructive">
              {listError}
            </p>
          ) : null}

          {editingId ? (
            <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Dealer name"
                  required
                  value={draft.dealerName}
                  onChange={(event) => setDraft((prev) => ({ ...prev, dealerName: event.target.value }))}
                />
                <TextField
                  label="Dealer code"
                  required
                  value={draft.dealerCode}
                  onChange={(event) => setDraft((prev) => ({ ...prev, dealerCode: event.target.value.toUpperCase() }))}
                />
              </div>

              <AddressFields
                title="Dealer address"
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
                  {editingId === 'new' ? 'Add dealer' : 'Save changes'}
                </Button>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="py-6 text-center">
              <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground/60" />
            </div>
          ) : rows.length > 0 ? (
            <ul className="divide-y divide-border rounded-lg border border-border/70">
              {rows.map((dealer) => (
                <li key={dealer._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {dealer.dealerName} · {dealer.code}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{addressSummary(dealer.address)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(dealer)}
                      aria-label={`Edit ${dealer.dealerName}`}
                      title="Edit"
                      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(dealer)}
                      disabled={togglingId === dealer._id}
                      aria-label={`${dealer.isActive ? 'Disable' : 'Enable'} ${dealer.dealerName}`}
                      title={dealer.isActive ? 'Disable dealer' : 'Enable dealer'}
                      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
                    >
                      {togglingId === dealer._id ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
              {dealers.length === 0 ? 'No dealers found.' : 'No dealers match your search.'}
            </p>
          )}
        </>
      ) : null}
    </section>
  )
}
