import { api } from './api-client'

// GET {{apiBaseUrl}}/dealer-masters/client/:clientId?active= -> Dealer[]
export async function listDealersApi({ clientId, active }) {
  const { data } = await api.get(`/dealer-masters/client/${clientId}`, { params: { active } })
  return data
}

// POST {{apiBaseUrl}}/dealer-masters
// {
//   clientId, dealerName, code,
//   address: { type: 'PINCODE'|'COORDINATES', pincodeAddress?, coordinatesAddress? }
// }
export async function createDealerApi(payload) {
  const { data } = await api.post('/dealer-masters', payload)
  return data
}

// PATCH {{apiBaseUrl}}/dealer-masters/:dealerId — same payload shape as create.
export async function updateDealerApi(dealerId, payload) {
  const { data } = await api.patch(`/dealer-masters/${dealerId}`, payload)
  return data
}

// PATCH {{apiBaseUrl}}/dealer-masters/active-status/:dealerId — { isActive }
export async function updateDealerActiveStatusApi(dealerId, payload) {
  const { data } = await api.patch(`/dealer-masters/active-status/${dealerId}`, payload)
  return data
}
