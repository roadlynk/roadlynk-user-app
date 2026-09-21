import { api } from './api-client'

// GET {{apiBaseUrl}}/drivers?companyId=&active=
// -> Driver[]
export async function listDriversApi({ companyId, active }) {
  const { data } = await api.get('/drivers', { params: { companyId, active } })
  return data
}

// POST {{apiBaseUrl}}/drivers
// {
//   name, licenceNumber, licenceExpiryDate, mobileNumber, licenceImageUrl, companyId
// }
// All fields are mandatory.
export async function createDriverApi(payload) {
  const { data } = await api.post('/drivers', payload)
  return data
}

// PATCH {{apiBaseUrl}}/drivers/:driverId — same payload shape as create.
export async function updateDriverApi(driverId, payload) {
  const { data } = await api.patch(`/drivers/${driverId}`, payload)
  return data
}

// PATCH {{apiBaseUrl}}/drivers/active-status/:driverId — { isActive }
export async function updateDriverActiveStatusApi(driverId, payload) {
  const { data } = await api.patch(`/drivers/active-status/${driverId}`, payload)
  return data
}
