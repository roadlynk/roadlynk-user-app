// Converts between the AddressFields component's flat editing shape
// ({ mode, pincode, state, district, town, address, latitude, longitude })
// and the nested { type, pincodeAddress | coordinatesAddress } shape the
// backend expects (delivery challans, dealer masters, ...).

export const EMPTY_DC_ADDRESS = {
  mode: 'pincode',
  pincode: '',
  state: '',
  district: '',
  town: '',
  address: '',
  latitude: '',
  longitude: '',
}

export function toAddressPayload(value) {
  if (value.mode === 'latlng') {
    return {
      type: 'COORDINATES',
      coordinatesAddress: {
        latitude: Number(value.latitude) || 0,
        longitude: Number(value.longitude) || 0,
        fullAddress: value.address,
      },
    }
  }
  return {
    type: 'PINCODE',
    pincodeAddress: {
      pincode: value.pincode,
      state: value.state,
      district: value.district,
      town: value.town,
      fullAddress: value.address,
    },
  }
}

export function fromAddressPayload(address) {
  if (!address) return EMPTY_DC_ADDRESS
  if (address.type === 'COORDINATES') {
    return {
      ...EMPTY_DC_ADDRESS,
      mode: 'latlng',
      latitude: String(address.coordinatesAddress?.latitude ?? ''),
      longitude: String(address.coordinatesAddress?.longitude ?? ''),
      address: address.coordinatesAddress?.fullAddress ?? '',
    }
  }
  return {
    ...EMPTY_DC_ADDRESS,
    mode: 'pincode',
    pincode: address.pincodeAddress?.pincode ?? '',
    state: address.pincodeAddress?.state ?? '',
    district: address.pincodeAddress?.district ?? '',
    town: address.pincodeAddress?.town ?? '',
    address: address.pincodeAddress?.fullAddress ?? '',
  }
}

/**
 * Checks an address in the flat AddressFields shape. Everything the chosen
 * input type shows is mandatory: pincode + state + district + town (pincode
 * mode) or latitude + longitude (lat/long mode), plus the address text.
 * Returns an error message, or null when it's complete.
 */
export function validateAddressValue(value) {
  if (value.mode === 'latlng') {
    const latitude = Number(value.latitude)
    const longitude = Number(value.longitude)
    if (String(value.latitude).trim() === '' || Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      return 'Enter a valid latitude (-90 to 90).'
    }
    if (String(value.longitude).trim() === '' || Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      return 'Enter a valid longitude (-180 to 180).'
    }
  } else {
    if (!/^\d{6}$/.test(String(value.pincode ?? '').trim())) return 'Enter a valid 6-digit pincode.'
    if (!value.state?.trim() || !value.district?.trim()) return 'Enter a valid pincode so the state and district are filled in.'
    if (!value.town?.trim()) return 'Select the town.'
  }
  if (!value.address?.trim()) return 'Enter the address.'
  return null
}

export function addressSummary(address) {
  return address?.pincodeAddress?.fullAddress || address?.coordinatesAddress?.fullAddress || '—'
}
