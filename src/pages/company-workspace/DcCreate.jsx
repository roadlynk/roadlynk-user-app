import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowLeft, FileText, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { CheckboxField, FormSection, ReadOnlyField, SelectField, TextAreaField } from '@/components/ui/form-kit'
import { cn } from '@/lib/utils'
import { addressSummary } from '@/lib/address-format'
import { listClientsApi } from '@/lib/client-service'
import { listTrucksApi } from '@/lib/truck-service'
import { listDriversApi } from '@/lib/driver-service'
import { listMaterialsApi } from '@/lib/material-service'
import { listDealersApi } from '@/lib/dealer-service'
import { filterBunksApi } from '@/lib/bunk-service'
import { getTransportRateAndLocationApi } from '@/lib/transport-rate-service'
import { createDeliveryChallanApi, updateDeliveryChallanApi, uploadOdometerImageApi } from '@/lib/delivery-challan-service'

const STEPS = ['Consignment', 'Material & truck', 'Advance & notes']

function DealerAddressPreview({ dealer }) {
  if (!dealer) return null
  const address = dealer.address
  const isPincode = address?.type === 'PINCODE'

  return (
    <div className="space-y-3 rounded-lg border border-border/70 bg-secondary/30 p-4 sm:col-span-2">
      <span className="inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-accent">
        {isPincode ? 'Pincode' : 'Latitude & Longitude'}
      </span>
      <div className="grid gap-4 sm:grid-cols-2">
        {isPincode ? (
          <>
            <ReadOnlyField label="Pincode" value={address.pincodeAddress?.pincode} />
            <ReadOnlyField label="State" value={address.pincodeAddress?.state} />
            <ReadOnlyField label="District" value={address.pincodeAddress?.district} />
            <ReadOnlyField label="Town" value={address.pincodeAddress?.town} />
          </>
        ) : (
          <>
            <ReadOnlyField label="Latitude" value={address?.coordinatesAddress?.latitude} />
            <ReadOnlyField label="Longitude" value={address?.coordinatesAddress?.longitude} />
          </>
        )}
        <ReadOnlyField label="Address" value={addressSummary(address)} className="sm:col-span-2" />
      </div>
    </div>
  )
}

export default function DcCreate() {
  const { company } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const existingDc = location.state?.editingDc ?? null
  const isEditing = Boolean(existingDc)

  const [step, setStep] = useState(0)
  const [error, setError] = useState(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [pending, setPending] = useState(false)

  const [clients, setClients] = useState([])
  const [trucks, setTrucks] = useState([])
  const [drivers, setDrivers] = useState([])
  const [materials, setMaterials] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(true)

  const [bunkOptions, setBunkOptions] = useState([])
  const [bunkChecking, setBunkChecking] = useState(false)

  const [dealers, setDealers] = useState([])
  const [dealersLoading, setDealersLoading] = useState(false)

  const [rateLookup, setRateLookup] = useState(null)
  const [rateLookupLoading, setRateLookupLoading] = useState(false)
  const [rateLookupError, setRateLookupError] = useState(null)

  const [odometerFile, setOdometerFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [form, setForm] = useState(() => ({
    invoice: existingDc?.companyDetails?.invoice ?? '',
    shipmentNumber: existingDc?.companyDetails?.shipmentNumber ?? '',
    companyDate: existingDc?.companyDetails?.date ? existingDc.companyDetails.date.slice(0, 10) : todayDate,

    consignorId: existingDc?.consignment?.consignorId ?? '',
    consignorBranchId: existingDc?.consignment?.consignorBranchId ?? '',
    consigneeId: existingDc?.consignment?.consigneeId ?? '',
    consigneeBranchId: existingDc?.consignment?.consigneeBranchId ?? '',
    account: existingDc?.consignment?.account ?? '',
    bunkName: existingDc?.consignment?.bunkName ?? '',

    deliveryDealerId: existingDc?.dealerDetails?.shipToDealerId ?? '',
    invoiceDealerId: existingDc?.dealerDetails?.invoiceDealerId ?? '',
    sameAsDelivery: existingDc?.dealerDetails?.isSame ?? false,

    truckId: existingDc?.truckDetails?.truckId ?? '',
    driverId: existingDc?.truckDetails?.driverId ?? '',

    materialId: existingDc?.material?.materialId ?? '',
    deliveryCategory: existingDc?.material?.deliveryCategory ?? '',
    loadingQuantity: existingDc?.material?.loadingQuantity ?? '',
    materialFieldValues: Object.fromEntries(
      Object.entries(existingDc?.material?.dynamicFields ?? {}).map(([fieldName, value]) => [fieldName, String(value)]),
    ),

    transportIncentive: existingDc?.rate?.transportIncentive ?? '',
    biddingAmount: existingDc?.rate?.biddingAmount ?? '',

    odometerImageUrl: existingDc?.distance?.odomenterImageUrl ?? null,
    odometerDistance: existingDc?.distance?.odometerDistance ?? '',

    cashAdvance: existingDc?.advance?.cashAdvance ?? '',
    dieselAdvance: existingDc?.advance?.dieselAdvance ?? '',
    bankAdvance: existingDc?.advance?.bankAdvance ?? '',
    isPaymentDone: existingDc?.advance?.isPaymentDone ?? true,

    notes: existingDc?.additionalInformation?.notes ?? '',
  }))

  useEffect(() => {
    let cancelled = false
    setOptionsLoading(true)

    Promise.all([
      listClientsApi({ companyId: company._id, active: true }),
      listTrucksApi({ companyId: company._id, active: true }),
      listDriversApi({ companyId: company._id, active: true }),
      listMaterialsApi({ companyId: company._id, active: true }),
    ])
      .then(([clientsResponse, trucksResponse, driversResponse, materialsResponse]) => {
        if (cancelled) return
        setClients(clientsResponse ?? [])
        setTrucks(trucksResponse ?? [])
        setDrivers(driversResponse ?? [])
        setMaterials(materialsResponse ?? [])
      })
      .catch((fetchError) => {
        if (cancelled) return
        setError(fetchError.response?.data?.message ?? 'Unable to load consignment options.')
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [company._id])

  function update(patch) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const consignor = clients.find((client) => client._id === form.consignorId) ?? null
  const consignee = clients.find((client) => client._id === form.consigneeId) ?? null
  const consignorBranches = (consignor?.branches ?? []).filter((branch) => branch.isActive)
  const consigneeBranches = (consignee?.branches ?? []).filter((branch) => branch.isActive)
  const consignorBranch = consignorBranches.find((branch) => branch._id === form.consignorBranchId) ?? null
  const clientOptions = clients.map((client) => ({ value: client._id, label: `${client.name} (${client.clientCode})` }))

  const material = materials.find((item) => item._id === form.materialId) ?? null
  const isCement = Boolean(material) && material.material.trim().toLowerCase() === 'cement'

  // Non-cement dealers are auto-matched (not user-picked), so only the name
  // is shown — the code is only meaningful for the cement dealer dropdown.
  const dealerOptions = dealers.map((dealer) => ({
    value: dealer._id,
    label: isCement ? `${dealer.dealerName}-${dealer.code}` : dealer.dealerName,
  }))
  const deliveryDealer = dealers.find((dealer) => dealer._id === form.deliveryDealerId) ?? null
  const invoiceDealer = dealers.find((dealer) => dealer._id === form.invoiceDealerId) ?? null

  const truck = trucks.find((item) => item._id === form.truckId) ?? null
  const driverOptions = drivers.map((driver) => ({ value: driver._id, label: `${driver.name} (${driver.mobileNumber})` }))

  const transportRate = rateLookup?.finalTransportRate ?? 0
  const transportIncentive = Number(form.transportIncentive) || 0
  const biddingAmount = Number(form.biddingAmount) || 0
  const totalTransportRate = transportRate + transportIncentive - biddingAmount

  const totalAdvance = form.isPaymentDone
    ? (Number(form.cashAdvance) || 0) + (Number(form.dieselAdvance) || 0) + (Number(form.bankAdvance) || 0)
    : (Number(form.cashAdvance) || 0) + (Number(form.dieselAdvance) || 0)

  // Account auto-fills as "<consignor code>-<consignor branch name>" whenever
  // either changes, but stays a plain editable text field afterward.
  useEffect(() => {
    if (!consignor || !consignorBranch) return
    update({ account: `${consignor.clientCode}-${consignorBranch.branchName}` })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consignor?._id, consignorBranch?._id])

  // Non-cement materials use a single dealer address for both invoice and
  // ship-to — the "Same as delivery address" toggle (and its section) is
  // hidden, so force it on instead of leaving invoiceDealerId unset.
  useEffect(() => {
    if (isCement || form.sameAsDelivery) return
    update({ sameAsDelivery: true, invoiceDealerId: form.deliveryDealerId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCement])

  const bunkSelectionComplete = Boolean(form.consignorId && form.consignorBranchId)

  useEffect(() => {
    setBunkOptions([])
    if (!bunkSelectionComplete) return

    let cancelled = false
    setBunkChecking(true)

    filterBunksApi({
      companyId: company._id,
      consignorId: form.consignorId,
      consignorBranchId: form.consignorBranchId,
    })
      .then((response) => {
        if (cancelled) return
        const names = response?.[0]?.bunkName ?? []
        setBunkOptions(names.map((name) => ({ value: name, label: name })))
        if (names.length === 1) update({ bunkName: names[0] })
      })
      .catch(() => {
        // No bunk configured for this consignor/branch combination — leave
        // the field optional rather than blocking the form.
      })
      .finally(() => {
        if (!cancelled) setBunkChecking(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bunkSelectionComplete, company._id, form.consignorId, form.consignorBranchId])

  // Delivery/invoice addresses are picked from the consignee's dealers.
  useEffect(() => {
    setDealers([])
    if (!form.consigneeId) return

    let cancelled = false
    setDealersLoading(true)

    listDealersApi({ clientId: form.consigneeId, active: true })
      .then((response) => {
        if (cancelled) return
        setDealers(response ?? [])
      })
      .catch(() => {
        // Leave dealers empty — the dealer selects below already handle
        // an empty options list.
      })
      .finally(() => {
        if (!cancelled) setDealersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [form.consigneeId])

  // For non-cement materials there's a single dealer address (no separate
  // ship-to): it's looked up by matching the consignee branch id against a
  // dealer's `code`, then used for both invoice and ship-to.
  useEffect(() => {
    if (isCement || !form.consigneeBranchId) return
    const matchedDealer = dealers.find((dealer) => dealer.code === form.consigneeBranchId)
    if (!matchedDealer) return
    update({ deliveryDealerId: matchedDealer._id, invoiceDealerId: matchedDealer._id, sameAsDelivery: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCement, form.consigneeBranchId, dealers])

  // Transport rate + lane distance are looked up once the consignor branch,
  // consignee, delivery dealer, material, truck capacity and load capacity
  // are all known — cleared back to empty the moment any of them isn't.
  const rateLookupReady = Boolean(
    form.consignorBranchId && form.consigneeId && form.deliveryDealerId && form.materialId && truck?.capacity && form.loadingQuantity,
  )

  useEffect(() => {
    setRateLookup(null)
    setRateLookupError(null)
    if (!rateLookupReady) return

    let cancelled = false
    setRateLookupLoading(true)

    getTransportRateAndLocationApi({
      companyId: company._id,
      consignorId: form.consignorId,
      consignorBranchId: form.consignorBranchId,
      consigneeId: form.consigneeId,
      dealerId: form.deliveryDealerId,
      materialId: form.materialId,
      truckCapacity: truck.capacity,
      loadCapacity: Number(form.loadingQuantity),
    })
      .then((response) => {
        if (cancelled) return
        setRateLookup(response ?? null)
      })
      .catch((fetchError) => {
        if (cancelled) return
        setRateLookupError(fetchError.response?.data?.message ?? 'Unable to fetch the transport rate.')
      })
      .finally(() => {
        if (!cancelled) setRateLookupLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rateLookupReady,
    company._id,
    form.consignorId,
    form.consignorBranchId,
    form.consigneeId,
    form.deliveryDealerId,
    form.materialId,
    truck?.capacity,
    form.loadingQuantity,
  ])

  // Cement bag count auto-calculates at 20 bags per unit of loading quantity.
  useEffect(() => {
    if (!material || material.material.trim().toLowerCase() !== 'cement') return
    const bagField = (material.materialSpecificFields ?? []).find((field) => /bag/i.test(field.fieldName))
    if (!bagField) return
    const quantity = Number(form.loadingQuantity) || 0
    setForm((prev) => ({
      ...prev,
      materialFieldValues: { ...prev.materialFieldValues, [bagField.fieldName]: String(quantity * 20) },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material?._id, form.loadingQuantity])

  function updateMaterialField(fieldName, value) {
    update({ materialFieldValues: { ...form.materialFieldValues, [fieldName]: value } })
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    setOdometerFile(file ?? null)
  }

  async function handleImageUpload() {
    if (!odometerFile) return
    setUploadingImage(true)
    try {
      const { url } = await uploadOdometerImageApi(odometerFile)
      update({ odometerImageUrl: url })
    } catch (uploadError) {
      setError(uploadError.response?.data?.message ?? 'Unable to upload the odometer photo.')
    } finally {
      setUploadingImage(false)
    }
  }

  function handleDeliveryDealerChange(dealerId) {
    update({
      deliveryDealerId: dealerId,
      invoiceDealerId: form.sameAsDelivery ? dealerId : form.invoiceDealerId,
    })
  }

  function handleSameAsDeliveryToggle(checked) {
    update({ sameAsDelivery: checked, invoiceDealerId: checked ? form.deliveryDealerId : form.invoiceDealerId })
  }

  function handleCancel() {
    if (!confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    navigate('..', { relative: 'path' })
  }

  function validateStep0() {
    if (!form.invoice.trim() || !form.shipmentNumber.trim() || !form.companyDate) {
      return 'Company invoice, shipment number and company date are required.'
    }
    if (!form.materialId) return 'Select a material.'
    if (!form.deliveryCategory) return 'Select a delivery category.'
    if (!form.loadingQuantity) return 'Enter the loading quantity.'
    if (!form.consignorId || !form.consignorBranchId) return 'Select a consignor and branch.'
    if (!form.consigneeId || !form.consigneeBranchId) return 'Select a consignee and branch.'
    if (!form.deliveryDealerId) return 'Select a delivery address dealer.'
    if (!form.sameAsDelivery && !form.invoiceDealerId) return 'Select an invoice address dealer.'
    return null
  }

  function validateBeforeSave() {
    const step0Error = validateStep0()
    if (step0Error) return step0Error
    if (!form.truckId) return 'Select a truck.'
    if (!form.driverId) return 'Select a driver.'
    if (!rateLookup?.finalTransportRate) return 'A transport rate could not be found for this combination.'
    return null
  }

  function buildPayload() {
    return {
      companyId: company._id,
      companyDetails: {
        invoice: form.invoice.trim(),
        shipmentNumber: form.shipmentNumber.trim(),
        date: form.companyDate,
      },
      consignment: {
        consignorId: form.consignorId,
        consignorBranchId: form.consignorBranchId,
        consigneeId: form.consigneeId,
        consigneeBranchId: form.consigneeBranchId,
        bunkName: form.bunkName,
        account: form.account.trim(),
      },
      dealerDetails: {
        invoiceDealerId: form.invoiceDealerId,
        shipToDealerId: form.deliveryDealerId,
        isSame: form.sameAsDelivery,
      },
      truckDetails: {
        truckId: form.truckId,
        driverId: form.driverId,
      },
      material: {
        materialId: form.materialId,
        deliveryCategory: form.deliveryCategory,
        loadingQuantity: Number(form.loadingQuantity) || 0,
        dynamicFields: Object.fromEntries(
          Object.entries(form.materialFieldValues).map(([fieldName, value]) => {
            const fieldDef = material?.materialSpecificFields?.find((field) => field.fieldName === fieldName)
            return [fieldName, fieldDef?.fieldType === 'number' ? Number(value) || 0 : value]
          }),
        ),
      },
      rate: {
        transportRate,
        transportIncentive,
        biddingAmount,
        totalTransportRate,
      },
      distance: {
        odomenterImageUrl: form.odometerImageUrl ?? '',
        odometerDistance: Number(form.odometerDistance) || 0,
        calculatedDistance: rateLookup?.calculatedDistance ?? 0,
        companyDistance: rateLookup?.companyDistance ?? 0,
      },
      advance: {
        cashAdvance: Number(form.cashAdvance) || 0,
        dieselAdvance: Number(form.dieselAdvance) || 0,
        bankAdvance: Number(form.bankAdvance) || 0,
        isPaymentDone: form.isPaymentDone,
        totalAdvance,
      },
      additionalInformation: {
        notes: form.notes.trim(),
      },
    }
  }

  async function handleSave(event) {
    event.preventDefault()
    const validationError = validateBeforeSave()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setPending(true)
    const payload = buildPayload()

    try {
      if (isEditing) {
        await updateDeliveryChallanApi(existingDc._id, payload)
      } else {
        await createDeliveryChallanApi(payload)
      }
      navigate('..', { relative: 'path' })
    } catch (submitError) {
      setPending(false)
      setError(submitError.response?.data?.message ?? 'Unable to save this delivery challan.')
    }
  }

  function handleNext() {
    if (step === 0) {
      const validationError = validateStep0()
      if (validationError) {
        setError(validationError)
        return
      }
    }
    setError(null)
    setStep((value) => Math.min(STEPS.length - 1, value + 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button asChild variant="outline" size="icon" aria-label="Back to delivery challans">
          <button type="button" onClick={() => navigate('..', { relative: 'path' })}>
            <ArrowLeft className="size-4" />
          </button>
        </Button>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {isEditing ? 'Edit delivery challan' : 'Create delivery challan'}
        </h2>
      </div>

      <div role="tablist" aria-label="Delivery challan steps" className="inline-flex rounded-md border border-border bg-secondary/50 p-1">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={step === index}
            onClick={() => setStep(index)}
            className={cn(
              'rounded-[5px] px-4 py-1.5 text-xs font-semibold transition-colors',
              step === index ? 'accent-fill shadow-accent' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-8 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
        {step === 0 ? (
          <div className="space-y-8">
            <FormSection title="Basic information">
              {isEditing ? (
                <>
                  <ReadOnlyField label="DC number" value={existingDc.dcNumber} />
                  <ReadOnlyField label="DC date" value={existingDc.dcDate?.slice(0, 10)} />
                </>
              ) : null}
              <TextField label="Company invoice" required value={form.invoice} onChange={(event) => update({ invoice: event.target.value })} />
              <TextField
                label="Shipment number"
                required
                value={form.shipmentNumber}
                onChange={(event) => update({ shipmentNumber: event.target.value })}
              />
              <TextField
                label="Company date"
                type="date"
                required
                value={form.companyDate}
                onChange={(event) => update({ companyDate: event.target.value })}
              />
            </FormSection>

            <FormSection title="Material">
              <SelectField
                label="Material"
                required
                value={form.materialId}
                onChange={(event) => update({ materialId: event.target.value, deliveryCategory: '', materialFieldValues: {} })}
                options={materials.map((item) => ({ value: item._id, label: item.material }))}
                placeholder={optionsLoading ? 'Loading materials…' : 'Select a material'}
                disabled={optionsLoading}
              />
              <SelectField
                label="Delivery category"
                required
                value={form.deliveryCategory}
                onChange={(event) => update({ deliveryCategory: event.target.value })}
                options={(material?.category ?? []).map((category) => ({ value: category, label: category }))}
                placeholder={material ? 'Select category' : 'Select a material first'}
                disabled={!material}
              />
              <TextField
                label={`Loading quantity${material ? ` (${material.quantityType})` : ''}`}
                type="number"
                required
                value={form.loadingQuantity}
                onChange={(event) => update({ loadingQuantity: event.target.value })}
              />
              {(material?.materialSpecificFields ?? []).map((field) =>
                field.fieldType === 'dropdown' ? (
                  <SelectField
                    key={field.fieldName}
                    label={field.fieldName}
                    value={form.materialFieldValues[field.fieldName] ?? ''}
                    onChange={(event) => updateMaterialField(field.fieldName, event.target.value)}
                    options={(field.values ?? []).map((value) => ({ value, label: value }))}
                    placeholder="Select"
                  />
                ) : (
                  <TextField
                    key={field.fieldName}
                    label={field.fieldName}
                    type={field.fieldType === 'number' ? 'number' : 'text'}
                    value={form.materialFieldValues[field.fieldName] ?? ''}
                    onChange={(event) => updateMaterialField(field.fieldName, event.target.value)}
                  />
                ),
              )}
            </FormSection>

            <FormSection title="Consignment">
              <SelectField
                label="Consignor"
                required
                value={form.consignorId}
                onChange={(event) => update({ consignorId: event.target.value, consignorBranchId: '' })}
                options={clientOptions}
                placeholder={optionsLoading ? 'Loading clients…' : 'Select consignor'}
                disabled={optionsLoading}
              />
              <SelectField
                label="Consignor branch"
                required
                value={form.consignorBranchId}
                onChange={(event) => update({ consignorBranchId: event.target.value })}
                options={consignorBranches.map((branch) => ({ value: branch._id, label: branch.branchName }))}
                placeholder={form.consignorId ? 'Select branch' : 'Select a consignor first'}
                disabled={!form.consignorId}
              />
              <SelectField
                label="Consignee"
                required
                value={form.consigneeId}
                onChange={(event) =>
                  update({ consigneeId: event.target.value, consigneeBranchId: '', deliveryDealerId: '', invoiceDealerId: '' })
                }
                options={clientOptions}
                placeholder={optionsLoading ? 'Loading clients…' : 'Select consignee'}
                disabled={optionsLoading}
              />
              <SelectField
                label="Consignee branch"
                required
                value={form.consigneeBranchId}
                onChange={(event) => update({ consigneeBranchId: event.target.value })}
                options={consigneeBranches.map((branch) => ({ value: branch._id, label: branch.branchName }))}
                placeholder={form.consigneeId ? 'Select branch' : 'Select a consignee first'}
                disabled={!form.consigneeId}
              />
              <TextField
                label="Account"
                required
                value={form.account}
                onChange={(event) => update({ account: event.target.value })}
                helperText="Pre-filled from the consignor code and branch — edit if needed."
              />
              <SelectField
                label="Bunk"
                value={form.bunkName}
                onChange={(event) => update({ bunkName: event.target.value })}
                options={bunkOptions}
                placeholder={!bunkSelectionComplete ? 'Select consignor and branch first' : bunkChecking ? 'Checking bunks…' : 'Select bunk'}
                disabled={!bunkSelectionComplete || bunkChecking || bunkOptions.length === 0}
              />
            </FormSection>

            <FormSection title="Invoice address">
              <SelectField
                label="Dealer"
                required
                value={form.deliveryDealerId}
                onChange={(event) => handleDeliveryDealerChange(event.target.value)}
                options={dealerOptions}
                placeholder={!form.consigneeId ? 'Select a consignee first' : dealersLoading ? 'Loading dealers…' : 'Select dealer'}
                disabled={!form.consigneeId || dealersLoading || !isCement}
                className="sm:col-span-2"
              />
              <DealerAddressPreview dealer={deliveryDealer} />
            </FormSection>

            {isCement ? (
              <>
                <CheckboxField label="Same as delivery address" checked={form.sameAsDelivery} onChange={handleSameAsDeliveryToggle} />

                <FormSection title="Ship-To address">
                  <SelectField
                    label="Dealer"
                    required
                    value={form.invoiceDealerId}
                    onChange={(event) => update({ invoiceDealerId: event.target.value })}
                    options={dealerOptions}
                    placeholder={!form.consigneeId ? 'Select a consignee first' : dealersLoading ? 'Loading dealers…' : 'Select dealer'}
                    disabled={!form.consigneeId || dealersLoading || form.sameAsDelivery}
                    className="sm:col-span-2"
                  />
                  <DealerAddressPreview dealer={form.sameAsDelivery ? deliveryDealer : invoiceDealer} />
                </FormSection>
              </>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-8">
            <FormSection title="Truck & driver">
              <SelectField
                label="Truck"
                required
                value={form.truckId}
                onChange={(event) => update({ truckId: event.target.value })}
                options={trucks.map((item) => ({ value: item._id, label: item.truckNumber }))}
                placeholder={optionsLoading ? 'Loading trucks…' : 'Select a truck'}
                disabled={optionsLoading}
              />
              <ReadOnlyField
                label={`Capacity${form.loadingQuantity ? ` (Loaded ${form.loadingQuantity}${material ? ` ${material.quantityType}` : ''})` : ''}`}
                value={truck?.capacity}
              />
              <ReadOnlyField label="Manufacturer" value={truck?.manufacturer} />
              <ReadOnlyField label="Owner" value={truck?.owner?.name} />
              <SelectField
                label="Driver"
                required
                value={form.driverId}
                onChange={(event) => update({ driverId: event.target.value })}
                options={driverOptions}
                placeholder={optionsLoading ? 'Loading drivers…' : 'Select a driver'}
                disabled={optionsLoading}
              />
            </FormSection>

            <FormSection
              title="Rate"
              description={!rateLookupReady ? 'Select the consignor branch, consignee, delivery dealer, material and truck first.' : undefined}
            >
              <ReadOnlyField
                label="Transport rate"
                value={rateLookupLoading ? 'Looking up…' : rateLookup ? `₹${rateLookup.finalTransportRate}` : ''}
              />
              <TextField
                label="Transport incentive"
                type="number"
                value={form.transportIncentive}
                onChange={(event) => update({ transportIncentive: event.target.value })}
              />
              <TextField
                label="Bidding amount"
                type="number"
                value={form.biddingAmount}
                onChange={(event) => update({ biddingAmount: event.target.value })}
              />
              <ReadOnlyField label="Total transport rate" value={`₹${totalTransportRate}`} />
              {rateLookupError ? <p className="text-xs text-destructive sm:col-span-2">{rateLookupError}</p> : null}
            </FormSection>

            <FormSection title="Distance">
              <div className="flex w-full flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Odometer photo</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleImageUpload} disabled={!odometerFile || uploadingImage}>
                    {uploadingImage ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    Upload
                  </Button>
                  {form.odometerImageUrl ? (
                    <a
                      href={form.odometerImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      <FileText className="size-3" />
                      View photo
                    </a>
                  ) : null}
                </div>
              </div>
              <TextField
                label="Odometer distance"
                type="number"
                value={form.odometerDistance}
                onChange={(event) => update({ odometerDistance: event.target.value })}
              />
              <ReadOnlyField
                label="Calculated distance (km)"
                value={rateLookupLoading ? 'Looking up…' : rateLookup ? `${rateLookup.calculatedDistance} km` : ''}
              />
              <ReadOnlyField
                label="Company distance (km)"
                value={rateLookupLoading ? 'Looking up…' : rateLookup ? `${rateLookup.companyDistance} km` : ''}
              />
            </FormSection>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-8">
            <FormSection title="Advance">
              <TextField
                label="Cash advance"
                type="number"
                value={form.cashAdvance}
                onChange={(event) => update({ cashAdvance: event.target.value })}
              />
              <TextField
                label="Diesel advance"
                type="number"
                value={form.dieselAdvance}
                onChange={(event) => update({ dieselAdvance: event.target.value })}
              />
              <TextField
                label="Bank advance"
                type="number"
                value={form.bankAdvance}
                onChange={(event) => update({ bankAdvance: event.target.value })}
              />
              <CheckboxField
                label="Payment done"
                hint="When checked, the total advance includes the bank advance too."
                checked={form.isPaymentDone}
                onChange={(checked) => update({ isPaymentDone: checked })}
                className="sm:col-span-2"
              />
              <ReadOnlyField label="Total advance" value={`₹${totalAdvance}`} className="sm:col-span-2" />
            </FormSection>
            <FormSection title="Additional information">
              <TextAreaField label="Notes" value={form.notes} onChange={(event) => update({ notes: event.target.value })} className="sm:col-span-2" />
            </FormSection>
          </div>
        ) : null}
      </form>

      {error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {confirmDiscard ? (
        <p role="alert" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          You have unsaved changes. Click Cancel again to discard them.
        </p>
      ) : null}

      <div className="flex flex-wrap justify-between gap-3">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
            Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" className="accent-fill" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" className="accent-fill" disabled={pending} onClick={handleSave}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save DC
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
