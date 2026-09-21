import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ChevronDown, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { FormSection, SelectField } from '@/components/ui/form-kit'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { listClientsApi } from '@/lib/client-service'
import { listMaterialsApi } from '@/lib/material-service'
import { listDealersApi } from '@/lib/dealer-service'
import { createTransportRateApi, filterTransportRatesApi } from '@/lib/transport-rate-service'

function emptyTier() {
  return { id: crypto.randomUUID(), fromLimit: '', toLimit: '', rate1: '', rate2: '', rate3: '' }
}

export default function TransportRate() {
  const { company } = useOutletContext()
  const companyId = company._id

  const [clients, setClients] = useState([])
  const [materials, setMaterials] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState(null)

  const [consignorId, setConsignorId] = useState('')
  const [consignorBranchId, setConsignorBranchId] = useState('')
  const [consigneeId, setConsigneeId] = useState('')
  const [dealerId, setDealerId] = useState('')
  const [materialId, setMaterialId] = useState('')

  const [dealers, setDealers] = useState([])
  const [dealersLoading, setDealersLoading] = useState(false)

  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState(null)
  const [rateChecked, setRateChecked] = useState(false)
  const [rates, setRates] = useState([])
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const [showForm, setShowForm] = useState(false)
  const [tiers, setTiers] = useState([emptyTier()])
  const [calculatedDistance, setCalculatedDistance] = useState('')
  const [companyDistance, setCompanyDistance] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState(() => new Date().toISOString().slice(0, 10))
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savingDistances, setSavingDistances] = useState(false)
  const [distanceError, setDistanceError] = useState(null)
  const [distancesSaved, setDistancesSaved] = useState(false)

  const fetchIdRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    setLoadingOptions(true)
    setOptionsError(null)

    Promise.all([listClientsApi({ companyId, active: true }), listMaterialsApi({ companyId, active: true })])
      .then(([clientsResponse, materialsResponse]) => {
        if (cancelled) return
        setClients(clientsResponse ?? [])
        setMaterials(materialsResponse ?? [])
      })
      .catch((fetchError) => {
        if (cancelled) return
        setOptionsError(fetchError.response?.data?.message ?? 'Unable to load clients or materials.')
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
  const materialOptions = materials.map((item) => ({ value: item._id, label: item.material }))

  // Dealers belong to the consignee client — fetch whenever it changes.
  useEffect(() => {
    setDealers([])
    setDealerId('')
    if (!consigneeId) return

    let cancelled = false
    setDealersLoading(true)

    listDealersApi({ clientId: consigneeId, active: true })
      .then((response) => {
        if (cancelled) return
        setDealers(response ?? [])
      })
      .catch(() => {
        // Leave dealers empty — the dealer select below already handles an
        // empty options list.
      })
      .finally(() => {
        if (!cancelled) setDealersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [consigneeId])

  const dealerOptions = dealers.map((dealer) => ({ value: dealer._id, label: `${dealer.dealerName} (${dealer.code})` }))

  const selectionComplete = Boolean(consignorId && consignorBranchId && consigneeId && dealerId && materialId)

  async function loadRates() {
    const requestId = ++fetchIdRef.current
    setChecking(true)
    setCheckError(null)

    try {
      const response = await filterTransportRatesApi({ companyId, consignorId, consignorBranchId, consigneeId, dealerId, materialId })
      if (fetchIdRef.current !== requestId) return
      setRates(response ?? [])
    } catch (fetchError) {
      if (fetchIdRef.current !== requestId) return
      setCheckError(fetchError.response?.data?.message ?? 'Unable to check the transport rate.')
      setRates([])
    } finally {
      if (fetchIdRef.current === requestId) {
        setChecking(false)
        setRateChecked(true)
      }
    }
  }

  useEffect(() => {
    setRateChecked(false)
    setRates([])
    setCheckError(null)
    setExpandedIds(new Set())
    setShowForm(false)
    setFormError(null)

    if (!selectionComplete) return
    loadRates()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionComplete, companyId, consignorId, consignorBranchId, consigneeId, dealerId, materialId])

  const sortedRates = [...rates].sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))
  const activeRate = rates.find((rate) => rate.isActive) ?? null
  const distancesDirty =
    Boolean(activeRate) &&
    (String(activeRate.calculatedDistance) !== String(calculatedDistance) || String(activeRate.companyDistance) !== String(companyDistance))

  // The lane distance belongs to the consignor/consignee/dealer/material
  // combination, not to any one tonnage-rate configuration — keep it synced
  // with whichever configuration is currently active.
  useEffect(() => {
    const active = rates.find((rate) => rate.isActive) ?? null
    setCalculatedDistance(active ? String(active.calculatedDistance) : '')
    setCompanyDistance(active ? String(active.companyDistance) : '')
  }, [rates])

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openAddForm() {
    // Start from the active configuration's tonnage tiers so changing a rate
    // is an edit, not a re-type of everything.
    const activeTiers = (activeRate?.tonnageRate ?? []).map((tier) => ({
      id: crypto.randomUUID(),
      fromLimit: String(tier.fromLimit),
      toLimit: String(tier.toLimit),
      rate1: String(tier.transportRate?.[0] ?? ''),
      rate2: String(tier.transportRate?.[1] ?? ''),
      rate3: String(tier.transportRate?.[2] ?? ''),
    }))
    setTiers(activeTiers.length > 0 ? activeTiers : [emptyTier()])
    setEffectiveFrom(new Date().toISOString().slice(0, 10))
    setFormError(null)
    setShowForm(true)
  }

  function addTier() {
    setTiers((prev) => [...prev, emptyTier()])
  }

  function removeTier(id) {
    setTiers((prev) => prev.filter((tier) => tier.id !== id))
  }

  function updateTier(id, patch) {
    setTiers((prev) => prev.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)))
  }

  // Distance-only change: there's no update endpoint, so it's saved the same
  // way as any change — as a new configuration that keeps the active
  // configuration's tonnage tiers and closes off the previous one.
  async function handleSaveDistances() {
    setDistanceError(null)
    setDistancesSaved(false)
    if (!activeRate) return
    if (!calculatedDistance || !companyDistance) {
      setDistanceError('Calculated distance and company distance are required.')
      return
    }

    setSavingDistances(true)
    try {
      await createTransportRateApi({
        companyId,
        consignorId,
        consignorBranchId,
        consigneeId,
        dealerId,
        materialId,
        tonnageRate: activeRate.tonnageRate.map((tier) => ({
          fromLimit: tier.fromLimit,
          toLimit: tier.toLimit,
          transportRate: tier.transportRate,
        })),
        effectiveFrom: new Date().toISOString().slice(0, 10),
        calculatedDistance: Number(calculatedDistance),
        companyDistance: Number(companyDistance),
        isActive: true,
      })
      await loadRates()
      setDistancesSaved(true)
    } catch (submitError) {
      setDistanceError(submitError.response?.data?.message ?? 'Unable to save the distances.')
    } finally {
      setSavingDistances(false)
    }
  }

  async function handleSave() {
    setFormError(null)

    if (tiers.length === 0) {
      setFormError('Add at least one tonnage tier.')
      return
    }
    for (const tier of tiers) {
      if (tier.fromLimit === '' || tier.toLimit === '' || tier.rate1 === '' || tier.rate2 === '' || tier.rate3 === '') {
        setFormError('Each tonnage tier needs a from/to limit and all 3 rate values.')
        return
      }
    }
    if (!calculatedDistance || !companyDistance || !effectiveFrom) {
      setFormError('Calculated distance, company distance and effective-from date are required.')
      return
    }

    const payload = {
      companyId,
      consignorId,
      consignorBranchId,
      consigneeId,
      dealerId,
      materialId,
      tonnageRate: tiers.map((tier) => ({
        fromLimit: Number(tier.fromLimit),
        toLimit: Number(tier.toLimit),
        transportRate: [Number(tier.rate1), Number(tier.rate2), Number(tier.rate3)],
      })),
      effectiveFrom,
      calculatedDistance: Number(calculatedDistance),
      companyDistance: Number(companyDistance),
      isActive: true,
    }

    setSaving(true)
    try {
      await createTransportRateApi(payload)
      setShowForm(false)
      await loadRates()
    } catch (submitError) {
      setFormError(submitError.response?.data?.message ?? 'Unable to save this transport rate.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Transport rate</h2>
        <p className="mt-1 text-sm text-muted-foreground">Look up and configure the transport rate for a consignor/consignee/dealer/material combination.</p>
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

        <FormSection title="Consignee">
          <SelectField
            label="Consignee"
            required
            value={consigneeId}
            onChange={(event) => setConsigneeId(event.target.value)}
            options={clientOptions}
            placeholder={loadingOptions ? 'Loading clients…' : 'Select consignee'}
            disabled={loadingOptions}
          />
          <SelectField
            label="Dealer"
            required
            value={dealerId}
            onChange={(event) => setDealerId(event.target.value)}
            options={dealerOptions}
            placeholder={!consigneeId ? 'Select a consignee first' : dealersLoading ? 'Loading dealers…' : 'Select dealer'}
            disabled={!consigneeId || dealersLoading}
          />
        </FormSection>

        <FormSection title="Material">
          <SelectField
            label="Material"
            required
            value={materialId}
            onChange={(event) => setMaterialId(event.target.value)}
            options={materialOptions}
            placeholder={loadingOptions ? 'Loading materials…' : 'Select material'}
            disabled={loadingOptions}
            className="sm:col-span-2"
          />
        </FormSection>
      </div>

      {!selectionComplete ? (
        <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
          Select the consignor, consignee, dealer and material to look up the rate.
        </p>
      ) : checking ? (
        <div className="rounded-lg border border-border/70 px-4 py-6 text-center">
          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">Checking rate…</p>
        </div>
      ) : checkError ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {checkError}
        </p>
      ) : rateChecked ? (
        <div className="space-y-5">
          <div className="grid gap-4 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl sm:grid-cols-2">
            <TextField
              label="Calculated distance (km)"
              type="number"
              required
              value={calculatedDistance}
              onChange={(event) => {
                setCalculatedDistance(event.target.value)
                setDistancesSaved(false)
              }}
            />
            <TextField
              label="Company distance (km)"
              type="number"
              required
              value={companyDistance}
              onChange={(event) => {
                setCompanyDistance(event.target.value)
                setDistancesSaved(false)
              }}
            />
            {distanceError ? <p className="text-xs text-destructive sm:col-span-2">{distanceError}</p> : null}
            {!activeRate ? (
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Distances are saved together with the first tonnage rate — use "Add new configuration" below.
              </p>
            ) : distancesDirty || savingDistances || distancesSaved ? (
              <div className="flex items-center justify-end gap-3 sm:col-span-2">
                {distancesSaved && !distancesDirty ? <p className="text-xs font-medium text-accent">Saved</p> : null}
                <Button type="button" onClick={handleSaveDistances} disabled={savingDistances || !distancesDirty} className="accent-fill">
                  {savingDistances ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">
              {sortedRates.length > 0 ? `${sortedRates.length} tonnage rate${sortedRates.length > 1 ? 's' : ''}` : 'No tonnage yet'}
            </p>
            {!showForm ? (
              <Button type="button" variant="outline" onClick={openAddForm}>
                <Plus className="size-4" />
                Add new configuration
              </Button>
            ) : null}
          </div>

          {showForm ? (
            <div className="space-y-5 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                  label="Effective from"
                  type="date"
                  required
                  value={effectiveFrom}
                  onChange={(event) => setEffectiveFrom(event.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>
                  Tonnage rates <span className="text-destructive">*</span>
                </Label>
                {tiers.map((tier) => (
                  <div key={tier.id} className="space-y-3 rounded-md border border-border bg-secondary/30 p-3">
                    <div className="flex flex-wrap items-end gap-3">
                      <TextField
                        label="From limit"
                        type="number"
                        value={tier.fromLimit}
                        onChange={(event) => updateTier(tier.id, { fromLimit: event.target.value })}
                        className="w-32"
                      />
                      <TextField
                        label="To limit"
                        type="number"
                        value={tier.toLimit}
                        onChange={(event) => updateTier(tier.id, { toLimit: event.target.value })}
                        className="w-32"
                      />
                      {tiers.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeTier(tier.id)}
                          aria-label="Remove tonnage tier"
                          title="Remove tier"
                          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="size-4" />
                        </button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <TextField
                        label="Rate 1"
                        type="number"
                        required
                        value={tier.rate1}
                        onChange={(event) => updateTier(tier.id, { rate1: event.target.value })}
                      />
                      <TextField
                        label="Rate 2"
                        type="number"
                        required
                        value={tier.rate2}
                        onChange={(event) => updateTier(tier.id, { rate2: event.target.value })}
                      />
                      <TextField
                        label="Rate 3"
                        type="number"
                        required
                        value={tier.rate3}
                        onChange={(event) => updateTier(tier.id, { rate3: event.target.value })}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addTier} className="w-fit">
                  <Plus className="size-4" />
                  Add tonnage tier
                </Button>
              </div>

              {formError ? <p className="text-xs text-destructive">{formError}</p> : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={saving} className="accent-fill">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save
                </Button>
              </div>
            </div>
          ) : null}

          {sortedRates.length === 0 && !showForm ? (
            <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
              No tonnage rate is configured for this combination yet.
            </p>
          ) : null}

          {sortedRates.length > 0 ? (
            <div className="space-y-3">
              {sortedRates.map((rate) => {
                const isExpanded = expandedIds.has(rate._id)
                return (
                  <div
                    key={rate._id}
                    className={cn(
                      'overflow-hidden rounded-xl border',
                      rate.isActive ? 'border-accent/40 bg-accent/8' : 'border-border/70 bg-card/92',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(rate._id)}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left"
                    >
                      <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200', isExpanded ? 'rotate-180' : '')} />
                      <span className="text-sm font-medium text-foreground">
                        {rate.effectiveFrom?.slice(0, 10)} – {rate.isActive ? 'Present' : rate.effectiveTo?.slice(0, 10) ?? '—'}
                      </span>
                      {rate.isActive ? (
                        <span className="ml-auto rounded-full bg-accent/15 px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-accent">
                          Active
                        </span>
                      ) : null}
                    </button>

                    {isExpanded ? (
                      <div className="space-y-4 border-t border-border/60 px-5 py-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                                <th className="py-2 pr-4 font-semibold">From</th>
                                <th className="py-2 pr-4 font-semibold">To</th>
                                <th className="py-2 font-semibold">Rates</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                              {rate.tonnageRate.map((tier, index) => (
                                <tr key={tier._id ?? index}>
                                  <td className="py-2 pr-4 text-foreground">{tier.fromLimit}</td>
                                  <td className="py-2 pr-4 text-foreground">{tier.toLimit}</td>
                                  <td className="py-2 text-foreground">{tier.transportRate.map((value) => `₹${value}`).join(', ')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                          <p>
                            Calculated distance: <span className="font-medium text-foreground">{rate.calculatedDistance} km</span>
                          </p>
                          <p>
                            Company distance: <span className="font-medium text-foreground">{rate.companyDistance} km</span>
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
