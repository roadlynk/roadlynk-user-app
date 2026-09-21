import { useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, IdCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { FormSection, PageForm } from '@/components/ui/form-kit'
import { Label } from '@/components/ui/label'
import { createDriverApi, updateDriverApi } from '@/lib/driver-service'
import { uploadImageApi } from '@/lib/image-service'
import { BankDetailsPanel } from '@/components/BankDetailsPanel'
import { HOLDER_TYPES } from '@/lib/bank-details-service'

export default function DriverForm() {
  const { company } = useOutletContext()
  const companyId = company._id
  const navigate = useNavigate()
  const location = useLocation()
  const { driverId } = useParams()
  const isEditing = Boolean(driverId)
  const existingDriver = location.state?.editingDriver ?? null
  const notFound = isEditing && !existingDriver

  const [form, setForm] = useState(() => ({
    name: existingDriver?.name ?? '',
    licenceNumber: existingDriver?.licenceNumber ?? '',
    licenceExpiryDate: (existingDriver?.licenceExpiryDate ?? '').slice(0, 10),
    mobileNumber: existingDriver?.mobileNumber ?? '',
    licenceImageUrl: existingDriver?.licenceImageUrl ?? null,
  }))
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const [createdDriver, setCreatedDriver] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  async function handlePhotoChange(event) {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return
    setError(null)
    setUploadingPhoto(true)
    try {
      const url = await uploadImageApi(file)
      setForm((prev) => ({ ...prev, licenceImageUrl: url }))
    } catch (uploadError) {
      setError(uploadError.response?.data?.message ?? 'Unable to upload the licence photo.')
      input.value = ''
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (uploadingPhoto) {
      setError('Wait for the licence photo to finish uploading.')
      return
    }

    if (!form.name.trim() || !form.licenceNumber.trim() || !form.licenceExpiryDate || !form.mobileNumber.trim() || !form.licenceImageUrl) {
      setError('Name, licence number, licence expiry date, mobile number and licence photo are all required.')
      return
    }

    const payload = {
      name: form.name.trim(),
      licenceNumber: form.licenceNumber.trim().toUpperCase(),
      licenceExpiryDate: form.licenceExpiryDate,
      mobileNumber: form.mobileNumber.trim(),
      licenceImageUrl: form.licenceImageUrl,
      companyId,
    }

    setPending(true)
    try {
      if (isEditing) {
        await updateDriverApi(existingDriver._id, payload)
        navigate('..', { relative: 'path' })
      } else {
        const created = await createDriverApi(payload)
        setPending(false)
        setCreatedDriver(created)
      }
    } catch (submitError) {
      setPending(false)
      setError(submitError.response?.data?.message ?? 'Unable to save this driver.')
    }
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
        <IdCard className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium text-foreground">Open this driver from the list to edit it.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to=".." relative="path">
            <ArrowLeft className="size-4" />
            Back to drivers
          </Link>
        </Button>
      </div>
    )
  }

  if (createdDriver) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Button asChild variant="outline" size="icon" aria-label="Back">
            <Link to=".." relative="path">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Driver created</h2>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{createdDriver.name}</span> was added to {company.companyName}.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <BankDetailsPanel holderType={HOLDER_TYPES.DRIVER} holderId={createdDriver._id} companyId={company._id} />
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
        title={isEditing ? 'Edit driver' : 'New driver'}
        backTo=".."
        onCancel={() => navigate('..', { relative: 'path' })}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? 'Save changes' : 'Create driver'}
        pending={pending || uploadingPhoto}
        error={error}
      >
        <FormSection title="Driver details">
          <TextField label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <TextField
            label="Licence number"
            required
            value={form.licenceNumber}
            onChange={(event) => setForm({ ...form, licenceNumber: event.target.value.toUpperCase() })}
          />
          <TextField
            label="Licence expiry date"
            type="date"
            required
            value={form.licenceExpiryDate}
            onChange={(event) => setForm({ ...form, licenceExpiryDate: event.target.value })}
          />
          <TextField
            label="Mobile"
            required
            value={form.mobileNumber}
            onChange={(event) => setForm({ ...form, mobileNumber: event.target.value })}
          />
          <div className="flex w-full flex-col gap-1.5 sm:col-span-2">
            <Label>
              Licence photo <span className="text-destructive">*</span>
            </Label>
            <input
              type="file"
              accept="application/pdf,image/*"
              required={!form.licenceImageUrl}
              onChange={handlePhotoChange}
              className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
            />
            {uploadingPhoto ? <p className="text-xs text-muted-foreground">Uploading photo…</p> : null}
            {form.licenceImageUrl ? (
              <a
                href={form.licenceImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                <FileText className="size-3" />
                View uploaded photo
              </a>
            ) : null}
          </div>
        </FormSection>
      </PageForm>

      {isEditing ? (
        <div className="rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <BankDetailsPanel holderType={HOLDER_TYPES.DRIVER} holderId={existingDriver._id} companyId={company._id} />
        </div>
      ) : null}
    </div>
  )
}
