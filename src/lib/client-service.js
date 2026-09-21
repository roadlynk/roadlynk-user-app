import { api } from './api-client'

// GET {{apiBaseUrl}}/clients?companyId=&active= -> Client[] (each includes branches[])
export async function listClientsApi({ companyId, active } = {}) {
  const { data } = await api.get('/clients', { params: { companyId, active } })
  return data
}

// POST {{apiBaseUrl}}/clients
// { name, clientCode, companyId }
export async function createClientApi(payload) {
  const { data } = await api.post('/clients', payload)
  return data
}

// ASSUMED — not given explicitly, inferred from the owners/drivers/trucks
// pattern (PATCH /:id with the same payload shape as create).
// PATCH {{apiBaseUrl}}/clients/:clientId
export async function updateClientApi(clientId, payload) {
  const { data } = await api.patch(`/clients/${clientId}`, payload)
  return data
}

// PATCH {{apiBaseUrl}}/clients/active-status/:clientId — { isActive }
export async function updateClientActiveStatusApi(clientId, payload) {
  const { data } = await api.patch(`/clients/active-status/${clientId}`, payload)
  return data
}
