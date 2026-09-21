import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CheckCircle2, Fuel, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { FormSection, SelectField } from '@/components/ui/form-kit'
import { Label } from '@/components/ui/label'
import { listClientsApi } from '@/lib/client-service'
import { filterBunksApi, saveBunksApi } from '@/lib/bunk-service'

function sameBunkNames(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

export default function BunkData() {
  const { company } = useOutletContext()
  const companyId = company._id

  const [clients, setClients] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState(null)

  const [consignorId, setConsignorId] = useState('')
  const [consignorBranchId, setConsignorBranchId] = useState('')

  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState(null)
  const [bunkChecked, setBunkChecked] = useState(false)
  const [bunkNames, setBunkNames] = useState([])
  const [savedBunkNames, setSavedBunkNames] = useState([])
  const [bunkDraft, setBunkDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoadingOptions(true)
    setOptionsError(null)

    listClientsApi({ companyId, active: true })
      .then((response) => {
        if (cancelled) return
        setClients(response ?? [])
      })
      .catch((fetchError) => {
        if (cancelled) return
        setOptionsError(fetchError.response?.data?.message ?? 'Unable to load clients.')
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false)
      })

    return () => {
      cancelled = true
    }
  }, [companyId])

  const consignor = clients.find((client) => client._id === consignorId) ?? null
  const consignorBranches = (consignor?.branches ?? []).filter((branch) => branch.isActive)
  const clientOptions = clients.map((client) => ({ value: client._id, label: `${client.name} (${client.clientCode})` }))

  const selectionComplete = Boolean(consignorId && consignorBranchId)

  useEffect(() => {
    setBunkChecked(false)
    setBunkNames([])
    setSavedBunkNames([])
    setCheckError(null)
    setBunkDraft('')
    setSaveError(null)
    setSaved(false)

    if (!selectionComplete) return

    let cancelled = false
    setChecking(true)

    filterBunksApi({ companyId, consignorId, consignorBranchId })
      .then((response) => {
        if (cancelled) return
        const names = response?.[0]?.bunkName ?? []
        setBunkNames(names)
        setSavedBunkNames(names)
        setBunkChecked(true)
      })
      .catch((fetchError) => {
        if (cancelled) return
        setCheckError(fetchError.response?.data?.message ?? 'Unable to load bunk data.')
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectionComplete, companyId, consignorId, consignorBranchId])

  const isDirty = !sameBunkNames(bunkNames, savedBunkNames)

  function addBunk() {
    const value = bunkDraft.trim()
    if (!value) return
    if (bunkNames.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
      setBunkDraft('')
      return
    }
    setBunkNames((prev) => [...prev, value])
    setBunkDraft('')
    setSaved(false)
  }

  function removeBunk(index) {
    setBunkNames((prev) => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  async function handleSave() {
    setSaveError(null)
    setSaving(true)
    try {
      await saveBunksApi({ companyId, consignorId, consignorBranchId, bunkName: bunkNames })
      setSavedBunkNames(bunkNames)
      setSaved(true)
    } catch (submitError) {
      setSaveError(submitError.response?.data?.message ?? 'Unable to save bunk data.')
    } finally {
      setSaving(false)
    }
  }

  function handleBunkKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addBunk()
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Bunk data</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage the fuel bunks configured for a consignor.</p>
      </div>

      {optionsError ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {optionsError}
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
            placeholder={loadingOptions ? 'Loading clients…' : 'Select consignor'}
            disabled={loadingOptions}
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

      {!selectionComplete ? (
        <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
          Select the consignor and branch to manage bunk data.
        </p>
      ) : checking ? (
        <div className="rounded-lg border border-border/70 px-4 py-6 text-center">
          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">Loading bunk data…</p>
        </div>
      ) : checkError ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {checkError}
        </p>
      ) : bunkChecked ? (
        <div className="space-y-4 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Fuel className="size-4 text-accent" />
            Bunks
          </Label>

          <div className="flex gap-2">
            <TextField
              hideLabel
              label="Add bunk"
              value={bunkDraft}
              onChange={(event) => setBunkDraft(event.target.value)}
              onKeyDown={handleBunkKeyDown}
              placeholder="Enter bunk name"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addBunk}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>

          {bunkNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {bunkNames.map((bunk, index) => (
                <span
                  key={`${bunk}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {bunk}
                  <button
                    type="button"
                    onClick={() => removeBunk(index)}
                    aria-label={`Remove ${bunk}`}
                    title="Remove"
                    className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No bunks added yet.</p>
          )}

          {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            {saved && !isDirty ? (
              <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <CheckCircle2 className="size-3.5" />
                Saved
              </p>
            ) : null}
            <Button type="button" onClick={handleSave} disabled={saving || !isDirty} className="accent-fill">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
