import { useState } from 'react'
import { Link, useLocation, useOutletContext } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Handshake, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { ClientBranchesPanel } from '@/components/ClientBranchesPanel'
import { ClientDealersPanel } from '@/components/ClientDealersPanel'
import { updateClientApi } from '@/lib/client-service'

export default function ClientDetail() {
  const { company } = useOutletContext()
  const location = useLocation()
  const client = location.state?.client ?? null

  const [form, setForm] = useState(() => ({
    name: client?.name ?? '',
    clientCode: client?.clientCode ?? '',
  }))
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [branchesVersion, setBranchesVersion] = useState(0)

  if (!client) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
        <Handshake className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium text-foreground">Open this client from the list to view it.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to=".." relative="path">
            <ArrowLeft className="size-4" />
            Back to clients
          </Link>
        </Button>
      </div>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSaved(false)

    if (!form.name.trim() || !form.clientCode.trim()) {
      setError('Name and client code are required.')
      return
    }

    const payload = {
      name: form.name.trim(),
      clientCode: form.clientCode.trim().toUpperCase(),
      companyId: company._id,
    }

    setPending(true)
    try {
      await updateClientApi(client._id, payload)
      setSaved(true)
    } catch (submitError) {
      setError(submitError.response?.data?.message ?? 'Unable to update this client.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Button asChild variant="outline" size="icon" aria-label="Back to clients">
            <Link to=".." relative="path">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Edit client</h2>
        </div>

        <div className="space-y-8 rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Client details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <TextField
                label="Client code"
                required
                value={form.clientCode}
                onChange={(event) => setForm({ ...form, clientCode: event.target.value.toUpperCase() })}
              />
            </div>
          </section>
        </div>

        {error ? (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          {saved ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
              <CheckCircle2 className="size-3.5" />
              Saved
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="accent-fill">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save changes
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
        <ClientBranchesPanel
          client={{ ...client, companyId: client.companyId ?? company._id }}
          onBranchSaved={() => setBranchesVersion((value) => value + 1)}
        />
      </div>

      <div className="rounded-xl border border-border/70 bg-card/92 px-6 py-6 shadow-card backdrop-blur-xl">
        <ClientDealersPanel client={client} branchesVersion={branchesVersion} />
      </div>
    </div>
  )
}
