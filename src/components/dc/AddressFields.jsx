import { TextField } from '@/components/ui/text-field'
import { SelectField, TextAreaField } from '@/components/ui/form-kit'
import { PincodeFields } from '@/components/PincodeFields'
import { EMPTY_DC_ADDRESS } from '@/lib/address-format'

const MODE_OPTIONS = [
  { value: 'pincode', label: 'Pincode' },
  { value: 'latlng', label: 'Latitude & Longitude' },
]

export function AddressFields({ title, description, value, onChange, disabled }) {
  function update(patch) {
    onChange({ ...value, ...patch })
  }

  const addressUnlocked = value.mode === 'latlng' || Boolean(value.town)

  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>

      <SelectField
        label="Location input"
        required
        value={value.mode}
        onChange={(event) => {
          // Clicking the selected option again reports '' — keep the last
          // choice instead of leaving the form with no input type at all.
          const nextMode = event.target.value
          if (!nextMode) return
          if (nextMode === value.mode) return
          // Switching type drops what was entered for the previous one.
          onChange({ ...EMPTY_DC_ADDRESS, mode: nextMode })
        }}
        options={MODE_OPTIONS}
        disabled={disabled}
        className="sm:max-w-xs"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {value.mode === 'pincode' ? (
          <PincodeFields value={value} onChange={onChange} disabled={disabled} required />
        ) : (
          <>
            <TextField label="Latitude" required value={value.latitude} onChange={(event) => update({ latitude: event.target.value })} disabled={disabled} />
            <TextField label="Longitude" required value={value.longitude} onChange={(event) => update({ longitude: event.target.value })} disabled={disabled} />
          </>
        )}
        <TextAreaField
          label="Address"
          required
          rows={2}
          value={value.address}
          onChange={(event) => update({ address: event.target.value })}
          disabled={disabled || !addressUnlocked}
          helperText={!addressUnlocked ? 'Enter a valid pincode and select the town first.' : undefined}
          className="sm:col-span-2"
        />
      </div>
    </section>
  )
}
