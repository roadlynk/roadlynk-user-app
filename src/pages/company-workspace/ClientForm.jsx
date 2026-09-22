import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { FormSection, PageForm } from '@/components/ui/form-kit'
import { TextField } from '@/components/ui/text-field'
import { createClientApi, getClientApi } from '@/lib/client-service'

export default function ClientForm() {
  const { company } = useOutletContext()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', clientCode: '' })
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

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
      const created = await createClientApi(payload)
      // Re-fetch by id so the detail page opens with the client's full,
      // server-confirmed record (including its branches[]).
      const client = await getClientApi(created._id).catch(() => created ?? null)

      if (client) {
        navigate(client._id, { state: { client }, relative: 'path' })
      } else {
        navigate('..', { relative: 'path' })
      }
    } catch (submitError) {
      setPending(false)
      setError(submitError.response?.data?.message ?? 'Unable to create this client.')
    }
  }

  return (
    <PageForm
      title="New client"
      backTo=".."
      onCancel={() => navigate('..', { relative: 'path' })}
      onSubmit={handleSubmit}
      submitLabel="Create client"
      pending={pending}
      error={error}
    >
      <FormSection title="Client details">
        <TextField label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <TextField
          label="Client code"
          required
          value={form.clientCode}
          onChange={(event) => setForm({ ...form, clientCode: event.target.value.toUpperCase() })}
        />
      </FormSection>
    </PageForm>
  )
}
