import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TextField } from '@/components/ui/text-field'
import { TextAreaField } from '@/components/ui/form-kit'
import { Textarea } from '@/components/ui/textarea'
import { PincodeFields } from '@/components/PincodeFields'
import { createCompany } from '@/lib/company-service'

const EMPTY_FORM = {
  companyName: '',
  companyCode: '',
  contactEmail: '',
  contactNumber: '',
  gstin: '',
  pan: '',
  fullAddress: '',
  town: '',
  district: '',
  state: '',
  pincode: '',
  internalNotes: '',
  isSaasClient: false,
}

export default function CompanyCreate({ onLogout }) {
  const navigate = useNavigate()
  const notesId = useId()

  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  function update(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (
      !form.companyName.trim() ||
      !form.companyCode.trim() ||
      !form.contactEmail.trim() ||
      !form.contactNumber.trim() ||
      !form.gstin.trim() ||
      !form.pan.trim() ||
      !form.pincode.trim() ||
      !form.town.trim() ||
      !form.fullAddress.trim()
    ) {
      setError('Fill in every field before creating this company.')
      return
    }

    const payload = {
      companyCode: form.companyCode.trim().toUpperCase(),
      companyName: form.companyName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactNumber: form.contactNumber.trim(),
      gstin: form.gstin.trim().toUpperCase(),
      pan: form.pan.trim().toUpperCase(),
      address: {
        pincode: form.pincode.trim(),
        state: form.state.trim(),
        district: form.district.trim(),
        town: form.town.trim(),
        fullAddress: form.fullAddress.trim(),
      },
      internalNotes: form.internalNotes.trim(),
      isSaasClient: form.isSaasClient,
    }

    setPending(true)
    try {
      await createCompany(payload)
      navigate('/companies')
    } catch (submitError) {
      if (submitError.response) {
        setError(submitError.response.data?.message ?? 'Unable to create the company. Please try again.')
        setPending(false)
        return
      }

      // TODO: remove once the real POST /companies backend is reachable —
      // lets the demo keep working end-to-end without a running API.
      navigate('/companies')
    }
  }

  return (
    <AppLayout onLogout={onLogout} eyebrow="Admin" title="Onboard a company">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Button asChild variant="outline" size="icon" aria-label="Back to companies">
            <Link to="/companies">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Onboard a company</h2>
        </div>

        <div className="space-y-8 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Company details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Company name" required value={form.companyName} onChange={update('companyName')} />
              <TextField
                label="Company code"
                required
                value={form.companyCode}
                onChange={(event) => setForm((prev) => ({ ...prev, companyCode: event.target.value.toUpperCase() }))}
              />
              <TextField label="Contact email" type="email" required value={form.contactEmail} onChange={update('contactEmail')} />
              <TextField label="Contact number" required value={form.contactNumber} onChange={update('contactNumber')} />
              <TextField label="GSTIN" required value={form.gstin} onChange={update('gstin')} />
              <TextField label="PAN" required value={form.pan} onChange={update('pan')} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Address</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <PincodeFields
                value={form}
                onChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
                required
              />
              <TextAreaField
                label="Full address"
                required
                rows={2}
                value={form.fullAddress}
                onChange={update('fullAddress')}
                disabled={!form.town}
                helperText={!form.town ? 'Enter a valid pincode and select the town first.' : undefined}
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Other</h3>
            <div className="space-y-2">
              <Label htmlFor={notesId}>Internal notes</Label>
              <Textarea id={notesId} value={form.internalNotes} onChange={update('internalNotes')} />
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-secondary/40 px-3.5 py-3">
              <Checkbox
                checked={form.isSaasClient}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isSaasClient: checked === true }))}
                className="mt-0.5"
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Sparkles className="size-3.5 text-accent" />
                  Mark as a client company
                </span>
                <span className="block text-xs text-muted-foreground">SaaS clients get access to the full RoadLynk platform, not just onboarding.</span>
              </span>
            </label>
          </section>
        </div>

        {error ? (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/companies')}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending} className="accent-fill">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Create company
          </Button>
        </div>
      </form>
    </AppLayout>
  )
}
