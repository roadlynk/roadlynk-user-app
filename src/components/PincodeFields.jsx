import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { TextField } from '@/components/ui/text-field'
import { ReadOnlyField, SelectField } from '@/components/ui/form-kit'
import { lookupPincodeApi } from '@/lib/pincode-service'

// The pincode API tags each post office name with its type (B.O / S.O / H.O)
// — sometimes at the end, sometimes followed by more text like a district in
// parentheses. Strip the tag wherever it appears, not just at the end.
function cleanOfficeName(name) {
  return (name ?? '')
    .replace(/\b[BSH]\.O\.?\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Pincode + State + District + Town, meant to sit inside a parent
 * `grid sm:grid-cols-2` alongside an Address field the parent gates on
 * `value.town` being set. Renders as a fragment (four grid cells), not a
 * wrapping element, so it drops directly into that grid.
 */
export function PincodeFields({ value, onChange, disabled, required }) {
  const [checking, setChecking] = useState(false)
  const [pincodeError, setPincodeError] = useState(null)
  const [townOptions, setTownOptions] = useState(value.town ? [{ value: value.town, label: value.town }] : [])

  function update(patch) {
    onChange({ ...value, ...patch })
  }

  async function handlePincodeChange(event) {
    const pincode = event.target.value.replace(/\D/g, '').slice(0, 6)
    setPincodeError(null)
    setTownOptions([])
    update({ pincode, state: '', district: '', town: '' })

    if (pincode.length !== 6) return

    setChecking(true)
    try {
      const response = await lookupPincodeApi(pincode)
      applyLookup(pincode, response)
    } catch {
      setPincodeError('Wrong pincode.')
      update({ pincode, state: '', district: '', town: '' })
    } finally {
      setChecking(false)
    }
  }

  function applyLookup(pincode, response) {
    const towns = Array.from(new Set((response.officename ?? []).map(cleanOfficeName).filter(Boolean)))
    setTownOptions(towns.map((town) => ({ value: town, label: town })))
    update({ pincode, state: response.statename ?? '', district: response.district ?? '', town: towns[0] ?? '' })
  }

  return (
    <>
      <TextField
        label="Pincode"
        required={required}
        inputMode="numeric"
        value={value.pincode}
        onChange={handlePincodeChange}
        disabled={disabled}
        error={pincodeError}
        trailing={checking ? <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" /> : null}
      />
      <ReadOnlyField label="State" value={value.state} />
      <ReadOnlyField label="District" value={value.district} />
      <SelectField
        label="Town"
        required={required}
        value={value.town}
        onChange={(event) => update({ town: event.target.value })}
        options={townOptions}
        placeholder={townOptions.length ? 'Select town' : 'Enter a valid pincode first'}
        disabled={disabled || townOptions.length === 0}
      />
    </>
  )
}
