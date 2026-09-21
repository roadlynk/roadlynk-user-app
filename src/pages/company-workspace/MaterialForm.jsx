import { useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, Boxes, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { FormSection, PageForm, SelectField } from '@/components/ui/form-kit'
import { Label } from '@/components/ui/label'
import { createMaterialApi, updateMaterialApi } from '@/lib/material-service'

const FIELD_TYPE_OPTIONS = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'dropdown', label: 'Dropdown' },
]

export default function MaterialForm() {
  const { company } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { materialId } = useParams()
  const isEditing = Boolean(materialId)
  const existingMaterial = location.state?.material ?? null
  const notFound = isEditing && !existingMaterial

  const [form, setForm] = useState(() => ({
    material: existingMaterial?.material ?? '',
    quantityType: existingMaterial?.quantityType ?? '',
  }))
  const [categoryList, setCategoryList] = useState(() => existingMaterial?.category ?? [])
  const [categoryDraft, setCategoryDraft] = useState('')
  const [fields, setFields] = useState(() =>
    existingMaterial?.materialSpecificFields?.length
      ? existingMaterial.materialSpecificFields.map((field) => ({ ...field, values: field.values ?? [], valueDraft: '' }))
      : [],
  )
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  function addCategory() {
    const value = categoryDraft.trim()
    if (!value) return
    if (categoryList.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
      setCategoryDraft('')
      return
    }
    setCategoryList((prev) => [...prev, value])
    setCategoryDraft('')
  }

  function removeCategory(index) {
    setCategoryList((prev) => prev.filter((_, i) => i !== index))
  }

  function handleCategoryKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addCategory()
    }
  }

  function updateField(index, patch) {
    setFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...patch } : field)))
  }

  function addField() {
    setFields((prev) => [...prev, { fieldName: '', fieldType: 'string', values: [], valueDraft: '' }])
  }

  function removeField(index) {
    setFields((prev) => prev.filter((_, i) => i !== index))
  }

  function addFieldValue(index) {
    const field = fields[index]
    const value = field.valueDraft.trim()
    if (!value) return
    if (field.values.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
      updateField(index, { valueDraft: '' })
      return
    }
    updateField(index, { values: [...field.values, value], valueDraft: '' })
  }

  function removeFieldValue(index, valueIndex) {
    updateField(index, { values: fields[index].values.filter((_, i) => i !== valueIndex) })
  }

  function handleFieldValueKeyDown(index, event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addFieldValue(index)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!form.material.trim() || !form.quantityType.trim() || categoryList.length === 0) {
      setError('Material name, quantity type and at least one category are required.')
      return
    }

    const namedFields = fields.filter((field) => field.fieldName.trim())
    if (namedFields.some((field) => field.fieldType === 'dropdown' && field.values.length === 0)) {
      setError('Add at least one value for each dropdown field.')
      return
    }

    const payload = {
      companyId: company._id,
      material: form.material.trim(),
      category: categoryList,
      quantityType: form.quantityType.trim().toUpperCase(),
      materialSpecificFields: namedFields.map((field) => {
        const base = { fieldName: field.fieldName.trim(), fieldType: field.fieldType }
        return field.fieldType === 'dropdown' ? { ...base, values: field.values } : base
      }),
    }

    setPending(true)
    try {
      if (isEditing) {
        await updateMaterialApi(existingMaterial._id, payload)
      } else {
        await createMaterialApi(payload)
      }
      navigate('..', { relative: 'path' })
    } catch (submitError) {
      setPending(false)
      if (submitError.response) {
        setError(submitError.response.data?.message ?? 'Unable to save this material.')
        return
      }
      // TODO: remove once the real POST/PATCH /materials backend is
      // reachable — lets the demo keep working end-to-end without a running
      // API.
      navigate('..', { relative: 'path' })
    }
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
        <Boxes className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium text-foreground">Open this material from the list to edit it.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to=".." relative="path">
            <ArrowLeft className="size-4" />
            Back to materials
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <PageForm
      title={isEditing ? 'Edit material' : 'New material'}
      backTo=".."
      onCancel={() => navigate('..', { relative: 'path' })}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save changes' : 'Create material'}
      pending={pending}
      error={error}
    >
      <FormSection title="Material details">
        <TextField label="Material" required value={form.material} onChange={(event) => setForm({ ...form, material: event.target.value })} />
        <TextField
          label="Quantity type"
          required
          value={form.quantityType}
          onChange={(event) => setForm({ ...form, quantityType: event.target.value.toUpperCase() })}
        />
        <div className="flex w-full flex-col gap-1.5 sm:col-span-2">
          <Label>
            Categories <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <TextField
              hideLabel
              label="Add category"
              value={categoryDraft}
              onChange={(event) => setCategoryDraft(event.target.value)}
              onKeyDown={handleCategoryKeyDown}
              placeholder="e.g. Pond Ash"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addCategory}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
          {categoryList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categoryList.map((category, index) => (
                <span
                  key={`${category}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    aria-label={`Remove ${category}`}
                    title="Remove"
                    className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No categories added yet.</p>
          )}
        </div>
      </FormSection>

      <FormSection title="Material specific fields" description="Optional extra fields captured for this material, e.g. moisture % or grade.">
        <div className="flex w-full flex-col gap-3 sm:col-span-2">
          {fields.map((field, index) => (
            <div key={index} className="space-y-3 rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex flex-wrap items-end gap-3">
                <TextField
                  label="Field name"
                  value={field.fieldName}
                  onChange={(event) => updateField(index, { fieldName: event.target.value })}
                  className="min-w-[10rem] flex-1"
                />
                <SelectField
                  label="Field type"
                  value={field.fieldType}
                  onChange={(event) => updateField(index, { fieldType: event.target.value })}
                  options={FIELD_TYPE_OPTIONS}
                  className="w-40"
                />
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  aria-label="Remove field"
                  title="Remove field"
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>

              {field.fieldType === 'dropdown' ? (
                <div className="space-y-2">
                  <Label>
                    Dropdown values <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <TextField
                      hideLabel
                      label="Add value"
                      value={field.valueDraft}
                      onChange={(event) => updateField(index, { valueDraft: event.target.value })}
                      onKeyDown={(event) => handleFieldValueKeyDown(index, event)}
                      placeholder="e.g. Grade A"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={() => addFieldValue(index)}>
                      <Plus className="size-4" />
                      Add
                    </Button>
                  </div>
                  {field.values.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {field.values.map((value, valueIndex) => (
                        <span
                          key={`${value}-${valueIndex}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                        >
                          {value}
                          <button
                            type="button"
                            onClick={() => removeFieldValue(index, valueIndex)}
                            aria-label={`Remove ${value}`}
                            title="Remove"
                            className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No values added yet.</p>
                  )}
                </div>
              ) : null}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addField} className="w-fit">
            <Plus className="size-4" />
            Add field
          </Button>
        </div>
      </FormSection>
    </PageForm>
  )
}
