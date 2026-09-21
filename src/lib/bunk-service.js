import { api } from './api-client'

// POST {{apiBaseUrl}}/bunks/filter
// { companyId, consignorId, consignorBranchId }
// -> Bunk[] (empty when nothing is configured for this combination)
export async function filterBunksApi(payload) {
  const { data } = await api.post('/bunks/filter', payload)
  return data
}

// POST {{apiBaseUrl}}/bunks — create or update: always send the full
// bunkName list.
// { companyId, consignorId, consignorBranchId, bunkName: string[] }
export async function saveBunksApi(payload) {
  const { data } = await api.post('/bunks', payload)
  return data
}
