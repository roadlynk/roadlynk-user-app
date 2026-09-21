import { api } from './api-client'

// POST {{apiBaseUrl}}/client-branches
// {
//   branchName, clientId,
//   address: { type: 'PINCODE'|'COORDINATES', pincodeAddress?, coordinatesAddress? }
// }
export async function createClientBranchApi(payload) {
  const { data } = await api.post('/client-branches', payload)
  return data
}

// PATCH {{apiBaseUrl}}/client-branches/:branchId — same payload shape as create.
export async function updateClientBranchApi(branchId, payload) {
  const { data } = await api.patch(`/client-branches/${branchId}`, payload)
  return data
}

// ASSUMED — not given explicitly, inferred from the /clients/active-status
// shape.
// PATCH {{apiBaseUrl}}/client-branches/active-status/:branchId — { isActive }
export async function updateClientBranchActiveStatusApi(branchId, payload) {
  const { data } = await api.patch(`/client-branches/active-status/${branchId}`, payload)
  return data
}
