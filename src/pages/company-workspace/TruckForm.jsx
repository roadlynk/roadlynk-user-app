import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, Truck as TruckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NumberField, TextField } from '@/components/ui/text-field'
import { FormSection, PageForm, SelectField } from '@/components/ui/form-kit'
import { listOwnersApi } from '@/lib/owner-service'
import { createTruckApi, updateTruckApi } from '@/lib/truck-service'

const MANUFACTURER_OPTIONS = [
  { value: 'MAHENDRA', label: 'Mahendra' },
  { value: 'TATA', label: 'Tata' },
  { value: 'EICHER', label: 'Eicher' },
  { value: 'ASHOK_LEYLAND', label: 'Ashok Leyland' },
]

const CERTIFICATE_FIELDS = [
  { key: 'fitnessCertificate', label: 'Fitness certificate' },
  { key: 'permitDate', label: 'Permit' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'pollutionCertificate', label: 'Pollution certificate' },
  { key: 'taxCertificate', label: 'Tax certificate' },
]

function emptyCertificate() {
  return { fromDate: '', toDate: '' }
}

function initialCertificateState(existingCertificate) {
  return CERTIFICATE_FIELDS.reduce((state, { key }) => {
    const existing = existingCertificate?.[key]
    state[key] = {
      fromDate: (existing?.fromDate ?? '').slice(0, 10),
      toDate: (existing?.toDate ?? '').slice(0, 10),
    }
    return state
  }, {})
}

export default function TruckForm() {
  const { company } = useOutletContext()
  const companyId = company._id
  const navigate = useNavigate()
  const location = useLocation()
  const { truckId } = useParams()
  const isEditing = Boolean(truckId)
  const existingTruck = location.state?.editingTruck ?? null
  const notFound = isEditing && !existingTruck

  const [form, setForm] = useState(() => ({
    truckNumber: existingTruck?.truckNumber ?? '',
    chasisNumber: existingTruck?.chasisNumber ?? '',
    capacity: existingTruck?.capacity ?? '',
    wheelType: existingTruck?.wheelType ?? '',
    fuelTankCapacity: existingTruck?.fuelTankCapacity ?? '',
    horsePower: existingTruck?.horsePower ?? '',
    manufacturer: existingTruck?.manufacturer ?? '',
    manufacturingYear: existingTruck?.manufacturingYear ?? '',
    ownerId: existingTruck?.ownerId ?? '',
  }))
  const [certificate, setCertificate] = useState(() => initialCertificateState(existingTruck?.certificate))
  const [owners, setOwners] = useState([])
  const [ownersLoading, setOwnersLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let cancelled = false
    setOwnersLoading(true)

    listOwnersApi({ companyId, active: true })
      .then((response) => {
        if (cancelled) return
        setOwners(response ?? [])
      })
      .catch((fetchError) => {
        if (cancelled) return
        setError(fetchError.response?.data?.message ?? 'Unable to load owners.')
      })
      .finally(() => {
        if (!cancelled) setOwnersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [companyId])

  const ownerOptions = owners.map((owner) => ({ value: owner._id, label: `${owner.name} (${owner.phoneNumber})` }))

  function setCertificateDate(key, field, value) {
    setCertificate({ ...certificate, [key]: { ...(certificate[key] ?? emptyCertificate()), [field]: value } })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    const truckNumber = form.truckNumber.trim().toUpperCase().replace(/\s+/g, '')
    if (!truckNumber || !form.chasisNumber.trim() || !form.manufacturer || !form.ownerId) {
      setError('Truck number, chasis number, manufacturer and owner are required.')
      return
    }
    if (!/^\d{4}$/.test(String(form.manufacturingYear))) {
      setError('Manufacturing year must be a 4-digit year.')
      return
    }
    for (const { key, label } of CERTIFICATE_FIELDS) {
      const { fromDate, toDate } = certificate[key]
      if (Boolean(fromDate) !== Boolean(toDate)) {
        setError(`${label}: pick both a from date and a to date.`)
        return
      }
      if (fromDate && toDate && toDate < fromDate) {
        setError(`${label}: the to date must be after the from date.`)
        return
      }
    }

    const certificatePayload = CERTIFICATE_FIELDS.reduce((result, { key }) => {
      const { fromDate, toDate } = certificate[key]
      if (fromDate && toDate) result[key] = { fromDate, toDate }
      return result
    }, {})

    const payload = {
      truckNumber,
      chasisNumber: form.chasisNumber.trim(),
      capacity: Number(form.capacity) || 0,
      wheelType: Number(form.wheelType) || 0,
      fuelTankCapacity: Number(form.fuelTankCapacity) || 0,
      horsePower: Number(form.horsePower) || 0,
      manufacturer: form.manufacturer,
      manufacturingYear: Number(form.manufacturingYear),
      ownerId: form.ownerId,
      certificate: certificatePayload,
      // The company can't change on edit, so companyId is only sent on create.
      ...(isEditing ? {} : { companyId }),
    }

    setPending(true)
    try {
      if (isEditing) {
        await updateTruckApi(existingTruck._id, payload)
      } else {
        await createTruckApi(payload)
      }
      navigate('..', { relative: 'path' })
    } catch (submitError) {
      setPending(false)
      setError(submitError.response?.data?.message ?? 'Unable to save this truck.')
    }
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
        <TruckIcon className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium text-foreground">Open this truck from the list to edit it.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to=".." relative="path">
            <ArrowLeft className="size-4" />
            Back to trucks
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <PageForm
      title={isEditing ? 'Edit truck' : 'New truck'}
      backTo=".."
      onCancel={() => navigate('..', { relative: 'path' })}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save changes' : 'Create truck'}
      pending={pending}
      error={error}
    >
      <FormSection title="Truck details">
        <TextField
          label="Truck number"
          required
          value={form.truckNumber}
          onChange={(event) => setForm({ ...form, truckNumber: event.target.value.toUpperCase() })}
        />
        <TextField
          label="Chasis number"
          required
          value={form.chasisNumber}
          onChange={(event) => setForm({ ...form, chasisNumber: event.target.value })}
        />
        <NumberField
          label="Capacity"
          value={form.capacity}
          onChange={(event) => setForm({ ...form, capacity: event.target.value })}
        />
        <NumberField
          label="Wheel type"
          value={form.wheelType}
          onChange={(event) => setForm({ ...form, wheelType: event.target.value })}
        />
        <NumberField
          label="Fuel tank capacity"
          value={form.fuelTankCapacity}
          onChange={(event) => setForm({ ...form, fuelTankCapacity: event.target.value })}
        />
        <NumberField
          label="Horse power"
          value={form.horsePower}
          onChange={(event) => setForm({ ...form, horsePower: event.target.value })}
        />
        <SelectField
          label="Manufacturer"
          required
          value={form.manufacturer}
          onChange={(event) => setForm({ ...form, manufacturer: event.target.value })}
          options={MANUFACTURER_OPTIONS}
        />
        <TextField
          label="Manufacturing year"
          value={form.manufacturingYear}
          onChange={(event) => setForm({ ...form, manufacturingYear: event.target.value })}
        />
      </FormSection>

      <FormSection title="Ownership">
        <SelectField
          label="Owner"
          required
          value={form.ownerId}
          onChange={(event) => setForm({ ...form, ownerId: event.target.value })}
          options={ownerOptions}
          placeholder={ownersLoading ? 'Loading owners…' : 'Select an owner'}
          disabled={ownersLoading}
          className="sm:col-span-2"
        />
      </FormSection>

      <FormSection title="Certificates" description="Optional — set a validity period for each certificate you have on file.">
        {CERTIFICATE_FIELDS.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-lg border border-border/60 bg-secondary/20 p-3 sm:col-span-2 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="text-sm font-medium text-foreground sm:w-48 sm:shrink-0">{label}</div>
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <TextField
                label="From"
                type="date"
                value={certificate[key].fromDate}
                onChange={(event) => setCertificateDate(key, 'fromDate', event.target.value)}
              />
              <TextField
                label="To"
                type="date"
                value={certificate[key].toDate}
                onChange={(event) => setCertificateDate(key, 'toDate', event.target.value)}
              />
            </div>
          </div>
        ))}
      </FormSection>
    </PageForm>
  )
}
