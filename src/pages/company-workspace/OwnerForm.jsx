import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { CheckboxField, FormSection, PageForm, ReadOnlyField, SelectField, TextAreaField } from '@/components/ui/form-kit'
import { Label } from '@/components/ui/label'
import { PincodeFields } from '@/components/PincodeFields'
import { createOwnerApi, updateOwnerApi } from '@/lib/owner-service'
import { uploadImageApi } from '@/lib/image-service'
import { BankDetailsPanel } from '@/components/BankDetailsPanel'
import { HOLDER_TYPES } from '@/lib/bank-details-service'

const BALANCE_TYPE_OPTIONS = [
  { value: 'DEBIT', label: 'Debit' },
  { value: 'CREDIT', label: 'Credit' },
]

/**
 * A TDS certificate on file exempts the owner entirely (0%). Otherwise the
 * rate is set by the PAN's 4th character: P = Individual (1%), C = Company (2%).
 */
function computeTdsPercentage({ pan, hasCertificate }) {
  if (hasCertificate) return 0
  const fourthChar = (pan ?? '').trim().toUpperCase()[3]
  if (fourthChar === 'C') return 2
  if (fourthChar === 'P') return 1
  return null
}

function parseTruckNumbers(raw) {
  return (raw ?? '')
    .split(/[\n,]+/)
    .map((value) => value.trim().toUpperCase().replace(/\s+/g, ''))
    .filter(Boolean)
}

const MAX_TDS_TRUCK_NUMBERS = 10

function findDuplicates(list) {
  const seen = new Set()
  const duplicates = new Set()
  for (const item of list) {
    if (seen.has(item)) duplicates.add(item)
    seen.add(item)
  }
  return Array.from(duplicates)
}

/** Returns an error message for the truck-number list, or null if it's valid. */
function validateTruckNumbers(list) {
  const duplicates = findDuplicates(list)
  if (duplicates.length > 0) return `Duplicate truck number(s): ${duplicates.join(', ')}`
  const uniqueCount = new Set(list).size
  if (uniqueCount > MAX_TDS_TRUCK_NUMBERS) return `Only ${MAX_TDS_TRUCK_NUMBERS} unique truck numbers are allowed (${uniqueCount} entered).`
  return null
}

export default function OwnerForm() {
  const { company } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { ownerId } = useParams()
  const isEditing = Boolean(ownerId)
  const existingOwner = location.state?.editingOwner ?? null
  const notFound = isEditing && !existingOwner

  const [form, setForm] = useState(() => ({
    name: existingOwner?.name ?? '',
    phoneNumber: existingOwner?.phoneNumber ?? '',
    email: existingOwner?.email ?? '',
    aadharNumber: existingOwner?.aadharNumber ?? '',
    pincode: existingOwner?.address?.pincode ?? '',
    state: existingOwner?.address?.state ?? '',
    district: existingOwner?.address?.district ?? '',
    town: existingOwner?.address?.town ?? '',
    fullAddress: existingOwner?.address?.fullAddress ?? '',
    panNumber: existingOwner?.panNumber ?? '',
    gstin: existingOwner?.gstin ?? '',
    isRental: existingOwner?.isRental ?? false,
    openingBalance: existingOwner?.openingBalance ?? 0,
    openingBalanceType: existingOwner?.openingBalanceType ?? 'DEBIT',
    tdsTruckNumberInput: (existingOwner?.tdsTruckNumber ?? []).join('\n'),
  }))
  // The backend has no field for the certificate file itself — it only ever
  // sees tdsPercentage/tdsTruckNumber — so this is a client-side gate only: a
  // brand-new rental owner must attach a certificate before the truck-number
  // field (and submission) unlocks, and a certificate on file always forces
  // tdsPercentage to 0. For an owner being edited, a saved 0% is the only
  // signal that a certificate previously existed — anything else means the
  // PAN-based rate was in effect and no certificate needs re-uploading.
  const [certificateFileName, setCertificateFileName] = useState(
    isEditing && existingOwner?.isRental && existingOwner?.tdsPercentage === 0 ? 'On file' : null,
  )
  const [certificateUrl, setCertificateUrl] = useState(existingOwner?.tdsCertificateUrl ?? null)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [truckNumberError, setTruckNumberError] = useState(null)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const [createdOwner, setCreatedOwner] = useState(null)
  const fileInputRef = useRef(null)

  const hasCertificate = Boolean(certificateFileName)
  const tdsPercentage = form.isRental ? computeTdsPercentage({ pan: form.panNumber, hasCertificate }) : null
  const showTruckNumberField = form.isRental && (isEditing || hasCertificate)

  function handleTruckNumbersChange(raw) {
    setForm({ ...form, tdsTruckNumberInput: raw })
    setTruckNumberError(validateTruckNumbers(parseTruckNumbers(raw)))
  }

  async function handleCertificateChange(event) {
    const input = event.target
    const file = input.files?.[0]
    if (!file) {
      setCertificateFileName(null)
      setCertificateUrl(null)
      return
    }
    setError(null)
    setUploadingCertificate(true)
    try {
      const url = await uploadImageApi(file)
      setCertificateUrl(url)
      setCertificateFileName(file.name)
    } catch (uploadError) {
      setError(uploadError.response?.data?.message ?? 'Unable to upload the TDS certificate.')
      input.value = ''
    } finally {
      setUploadingCertificate(false)
    }
  }

  function handleClearCertificate() {
    setCertificateFileName(null)
    setCertificateUrl(null)
    setForm({ ...form, tdsTruckNumberInput: '' })
    setTruckNumberError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleRentalToggle(checked) {
    setForm({ ...form, isRental: checked, tdsTruckNumberInput: checked ? form.tdsTruckNumberInput : '' })
    if (!checked) {
      setCertificateFileName(isEditing ? certificateFileName : null)
      setTruckNumberError(null)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (uploadingCertificate) {
      setError('Wait for the TDS certificate to finish uploading.')
      return
    }

    if (!form.name.trim() || !form.panNumber.trim() || !form.phoneNumber.trim() || !form.gstin.trim()) {
      setError('Name, PAN, GSTIN and phone number are required.')
      return
    }
    if (!/^\d{6}$/.test(form.pincode.trim()) || !form.state.trim() || !form.district.trim() || !form.town.trim() || !form.fullAddress.trim()) {
      setError('Enter a valid pincode, select the town and fill in the full address.')
      return
    }

    let tdsTruckNumber = []
    if (form.isRental) {
      if (!isEditing && !hasCertificate) {
        setError('Upload the TDS certificate before saving.')
        return
      }
      tdsTruckNumber = parseTruckNumbers(form.tdsTruckNumberInput)
      if (tdsTruckNumber.length === 0) {
        setTruckNumberError('Enter at least one truck number — required once the TDS certificate is uploaded.')
        return
      }
      const truckNumbersMessage = validateTruckNumbers(tdsTruckNumber)
      if (truckNumbersMessage) {
        setTruckNumberError(truckNumbersMessage)
        return
      }
    }

    const payload = {
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      aadharNumber: form.aadharNumber.trim(),
      address: {
        pincode: form.pincode.trim(),
        state: form.state.trim(),
        district: form.district.trim(),
        town: form.town.trim(),
        fullAddress: form.fullAddress.trim(),
      },
      panNumber: form.panNumber.trim().toUpperCase(),
      gstin: form.gstin.trim().toUpperCase(),
      isRental: form.isRental,
      accountGroup: form.isRental ? 'CREDIT' : 'ASSET',
      openingBalance: Number(form.openingBalance) || 0,
      openingBalanceType: form.openingBalanceType,
      tdsTruckNumber: form.isRental ? tdsTruckNumber : [],
      tdsPercentage: form.isRental ? (tdsPercentage ?? 0) : 0,
      ...(form.isRental && certificateUrl ? { tdsCertificateUrl: certificateUrl } : {}),
      // The company can't change on edit, so companyId is only sent on create.
      ...(isEditing ? {} : { companyId: company._id }),
    }

    setPending(true)
    try {
      if (isEditing) {
        await updateOwnerApi(existingOwner._id, payload)
        navigate('..', { relative: 'path' })
      } else {
        const created = await createOwnerApi(payload)
        setPending(false)
        setCreatedOwner(created)
      }
    } catch (submitError) {
      setPending(false)
      setError(submitError.response?.data?.message ?? 'Unable to save this owner.')
    }
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
        <Building2 className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium text-foreground">Open this owner from the list to edit it.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to=".." relative="path">
            <ArrowLeft className="size-4" />
            Back to owners
          </Link>
        </Button>
      </div>
    )
  }

  if (createdOwner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Button asChild variant="outline" size="icon" aria-label="Back">
            <Link to=".." relative="path">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Owner created</h2>
        </div>

        <div className="space-y-8 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{createdOwner.name}</span> was added to {company.companyName}.
          </p>

          <FormSection title="Identity">
            <ReadOnlyField label="Name" value={createdOwner.name} />
            <ReadOnlyField label="PAN" value={createdOwner.panNumber} />
            <ReadOnlyField label="Aadhar number" value={createdOwner.aadharNumber} />
            <ReadOnlyField label="GSTIN" value={createdOwner.gstin} />
          </FormSection>

          <FormSection title="Contact">
            <ReadOnlyField label="Phone number" value={createdOwner.phoneNumber} />
            <ReadOnlyField label="Email" value={createdOwner.email} />
          </FormSection>

          <FormSection title="Address">
            <ReadOnlyField label="Pincode" value={createdOwner.address?.pincode} />
            <ReadOnlyField label="State" value={createdOwner.address?.state} />
            <ReadOnlyField label="District" value={createdOwner.address?.district} />
            <ReadOnlyField label="Town" value={createdOwner.address?.town} />
            <ReadOnlyField label="Full address" value={createdOwner.address?.fullAddress} className="sm:col-span-2" />
          </FormSection>

          <FormSection title="Accounting">
            <ReadOnlyField label="Rental owner" value={createdOwner.isRental ? 'Yes' : 'No'} />
            <ReadOnlyField label="Account group" value={createdOwner.accountGroup} />
            <ReadOnlyField
              label="Opening balance"
              value={createdOwner.openingBalance != null ? `${createdOwner.openingBalance} (${createdOwner.openingBalanceType})` : '—'}
            />
          </FormSection>

          {createdOwner.isRental ? (
            <FormSection title="TDS">
              <ReadOnlyField label="TDS percentage" value={createdOwner.tdsPercentage != null ? `${createdOwner.tdsPercentage}%` : '—'} />
              <ReadOnlyField
                label="TDS truck numbers"
                value={(createdOwner.tdsTruckNumber ?? []).join(', ') || '—'}
                className="sm:col-span-2"
              />
            </FormSection>
          ) : null}
        </div>

        <div className="rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <BankDetailsPanel
            holderType={HOLDER_TYPES.OWNER}
            holderId={createdOwner._id}
            companyId={company._id}
            isRental={Boolean(createdOwner.isRental)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => navigate('..', { relative: 'path' })} className="accent-fill">
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageForm
        title={isEditing ? 'Edit owner' : 'New owner'}
        backTo=".."
        onCancel={() => navigate('..', { relative: 'path' })}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? 'Save changes' : 'Create owner'}
        pending={pending || uploadingCertificate}
        error={error}
      >
        <FormSection title="Identity">
          <TextField label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <TextField
            label="PAN"
            required
            value={form.panNumber}
            onChange={(event) => setForm({ ...form, panNumber: event.target.value.toUpperCase() })}
          />
          <TextField label="Aadhar number" value={form.aadharNumber} onChange={(event) => setForm({ ...form, aadharNumber: event.target.value })} />
          <TextField
            label="GSTIN"
            required
            value={form.gstin}
            onChange={(event) => setForm({ ...form, gstin: event.target.value.toUpperCase() })}
          />
        </FormSection>

        <FormSection title="Contact">
          <TextField label="Phone number" required value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
          <TextField label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </FormSection>

        <FormSection title="Address">
          <PincodeFields value={form} onChange={(next) => setForm({ ...form, ...next })} required />
          <TextAreaField
            label="Full address"
            required
            rows={2}
            value={form.fullAddress}
            onChange={(event) => setForm({ ...form, fullAddress: event.target.value })}
            disabled={!form.town}
            helperText={!form.town ? 'Enter a valid pincode and select the town first.' : undefined}
            className="sm:col-span-2"
          />
        </FormSection>

        <FormSection title="Accounting">
          <CheckboxField
            label="Rental owner"
            hint="Rental owners are grouped under Credit instead of Asset, and require TDS details."
            checked={form.isRental}
            onChange={handleRentalToggle}
            className="sm:col-span-2"
          />
          <ReadOnlyField label="Account group" value={form.isRental ? 'CREDIT' : 'ASSET'} className="sm:col-span-2" />
          <TextField
            label="Opening balance"
            type="number"
            value={form.openingBalance}
            onChange={(event) => setForm({ ...form, openingBalance: event.target.value })}
          />
          <SelectField
            label="Type"
            value={form.openingBalanceType}
            onChange={(event) => setForm({ ...form, openingBalanceType: event.target.value })}
            options={BALANCE_TYPE_OPTIONS}
          />
        </FormSection>

        {form.isRental ? (
          <FormSection title="TDS">
            <ReadOnlyField
              label="TDS percentage"
              value={tdsPercentage != null ? `${tdsPercentage}%` : '—'}
              hint={hasCertificate ? 'A TDS certificate is on file, so this owner is exempt (0%).' : undefined}
            />
            <div className="flex w-full flex-col gap-1.5 sm:col-span-2">
              <Label>TDS certificate {!isEditing ? <span className="text-destructive">*</span> : null}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/*"
                required={!isEditing && !certificateFileName}
                onChange={handleCertificateChange}
                className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
              />
              {uploadingCertificate ? <p className="text-xs text-muted-foreground">Uploading certificate…</p> : null}
              {certificateFileName ? (
                <p className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-accent">
                  <FileText className="size-3" />
                  {certificateFileName}
                  <button
                    type="button"
                    onClick={handleClearCertificate}
                    aria-label="Clear TDS certificate"
                    title="Clear certificate"
                    className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Upload the certificate to enter this owner&rsquo;s TDS truck numbers.</p>
              )}
            </div>
            {showTruckNumberField ? (
              <TextAreaField
                label={
                  <>
                    TDS truck numbers <span className="text-destructive">*</span>
                  </>
                }
                value={form.tdsTruckNumberInput}
                onChange={(event) => handleTruckNumbersChange(event.target.value)}
                error={truckNumberError}
                helperText={
                  truckNumberError
                    ? undefined
                    : `${parseTruckNumbers(form.tdsTruckNumberInput).length} of ${MAX_TDS_TRUCK_NUMBERS} truck(s) listed. One per line, or comma separated.`
                }
                className="sm:col-span-2"
              />
            ) : null}
            <p className="sm:col-span-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-900">
              TODO: once this owner&rsquo;s total transactions exceed ₹1,00,000, TDS should stop applying — this rule still needs to be built.
            </p>
          </FormSection>
        ) : null}
      </PageForm>

      {isEditing ? (
        <div className="rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <BankDetailsPanel
            holderType={HOLDER_TYPES.OWNER}
            holderId={existingOwner._id}
            companyId={company._id}
            isRental={Boolean(existingOwner.isRental)}
          />
        </div>
      ) : null}
    </div>
  )
}
