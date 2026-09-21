import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Pencil, Percent, Plus, Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { EmptyState, TableShell } from '@/components/ui/form-kit'
import { StatusPill } from '@/components/shared/StatusPill'
import { activateGstConfigApi, createGstConfigApi, listGstConfigsApi, updateGstConfigApi } from '@/lib/gst-configurer-service'

const EMPTY_DRAFT = { code: '', percentage: '', effectiveFrom: '', effectiveTo: '' }

function toDateInputValue(isoString) {
  return isoString ? isoString.slice(0, 10) : ''
}

export default function GstConfigurer({ onLogout }) {
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [search, setSearch] = useState('')

  // null = form closed, 'new' = adding, otherwise the _id being edited.
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activatingId, setActivatingId] = useState(null)

  const refreshConfigs = useCallback(async () => {
    setListError(null)
    try {
      const response = await listGstConfigsApi()
      setConfigs(response ?? [])
    } catch (fetchError) {
      setListError(fetchError.response?.data?.message ?? 'Unable to load GST configurations.')
      setConfigs([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refreshConfigs().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshConfigs])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return configs
    return configs.filter((item) => item.code.toLowerCase().includes(q))
  }, [configs, search])

  function startAdd() {
    setEditingId('new')
    setDraft(EMPTY_DRAFT)
    setFormError(null)
  }

  function startEdit(item) {
    setEditingId(item._id)
    setDraft({
      code: item.code,
      percentage: String(item.percentage),
      effectiveFrom: toDateInputValue(item.effectiveFrom),
      effectiveTo: toDateInputValue(item.effectiveTo),
    })
    setFormError(null)
  }

  function cancelForm() {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
    setFormError(null)
  }

  async function handleSave() {
    setFormError(null)

    const code = draft.code.trim().toUpperCase()
    const percentage = Number(draft.percentage)

    if (!code || !draft.effectiveFrom || draft.percentage.trim() === '' || Number.isNaN(percentage)) {
      setFormError('Code, percentage and effective-from date are required.')
      return
    }

    const payload = {
      code,
      percentage,
      effectiveFrom: new Date(draft.effectiveFrom).toISOString(),
      ...(draft.effectiveTo ? { effectiveTo: new Date(draft.effectiveTo).toISOString() } : {}),
    }

    setSaving(true)
    try {
      if (editingId === 'new') {
        await createGstConfigApi(payload)
      } else {
        await updateGstConfigApi(editingId, payload)
      }
      await refreshConfigs()
      cancelForm()
    } catch (submitError) {
      setFormError(submitError.response?.data?.message ?? 'Unable to save this GST configuration.')
    } finally {
      setSaving(false)
    }
  }

  async function handleActivate(item) {
    setListError(null)
    setActivatingId(item._id)
    try {
      await activateGstConfigApi(item._id)
      await refreshConfigs()
    } catch (activateError) {
      setListError(activateError.response?.data?.message ?? 'Unable to activate this GST configuration.')
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <AppLayout onLogout={onLogout} eyebrow="Masters" title="GST Configurer">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">GST configurations</h2>
            <p className="mt-1 text-sm text-muted-foreground">GST rate slabs used across owners, trucks and DC creation. Only one can be active at a time.</p>
          </div>
          <Button className="accent-fill" onClick={startAdd}>
            <Plus className="size-4" />
            New GST configuration
          </Button>
        </div>

        {editingId ? (
          <div className="space-y-4 rounded-xl border border-border/70 bg-card/92 p-5 shadow-card backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Code"
                required
                value={draft.code}
                onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })}
              />
              <TextField
                label="Percentage"
                type="number"
                required
                value={draft.percentage}
                onChange={(event) => setDraft({ ...draft, percentage: event.target.value })}
              />
              <TextField
                label="Effective from"
                type="date"
                required
                value={draft.effectiveFrom}
                onChange={(event) => setDraft({ ...draft, effectiveFrom: event.target.value })}
              />
              <TextField
                label="Effective to"
                type="date"
                value={draft.effectiveTo}
                onChange={(event) => setDraft({ ...draft, effectiveTo: event.target.value })}
              />
            </div>
            {formError ? <p className="text-xs text-destructive">{formError}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelForm}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingId === 'new' ? 'Create' : 'Save changes'}
              </Button>
            </div>
          </div>
        ) : null}

        {listError ? (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {listError}
          </p>
        ) : null}

        <TableShell
          toolbar={
            <>
              <div className="relative min-w-[14rem] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by code"
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {rows.length} of {configs.length} configurations
              </p>
            </>
          }
        >
          {loading ? (
            <div className="px-6 py-16 text-center">
              <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/60" />
              <p className="mt-3 text-sm text-muted-foreground">Loading GST configurations…</p>
            </div>
          ) : rows.length === 0 ? (
            <EmptyState icon={Percent} title="No GST configurations found" description="Try a different search, or add a new one." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Code</th>
                    <th className="px-5 py-3 font-semibold">Percentage</th>
                    <th className="px-5 py-3 font-semibold">Effective from</th>
                    <th className="px-5 py-3 font-semibold">Effective to</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((item) => (
                    <tr key={item._id}>
                      <td className="px-5 py-4 font-medium text-foreground">{item.code}</td>
                      <td className="px-5 py-4 text-muted-foreground">{item.percentage}%</td>
                      <td className="px-5 py-4 text-muted-foreground">{toDateInputValue(item.effectiveFrom) || '—'}</td>
                      <td className="px-5 py-4 text-muted-foreground">{toDateInputValue(item.effectiveTo) || '—'}</td>
                      <td className="px-5 py-4">
                        <StatusPill active={item.isActive} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            aria-label={`Edit ${item.code}`}
                            title="Edit"
                            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                          >
                            <Pencil className="size-4" />
                          </button>
                          {!item.isActive ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(item)}
                              disabled={activatingId === item._id}
                            >
                              {activatingId === item._id ? <Loader2 className="size-3.5 animate-spin" /> : null}
                              Activate
                            </Button>
                          ) : null}
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
    </AppLayout>
  )
}
