import { api } from './api-client'

// GET {{apiBaseUrl}}/bunks?companyId=...
// -> Bunk[]: { _id, companyId, name, createdAt, updatedAt }
export async function listBunksApi({ companyId }) {
  const { data } = await api.get('/bunks', { params: { companyId } })
  return data
}

// POST {{apiBaseUrl}}/bunks
// { companyId, name }
export async function createBunkApi(payload) {
  const { data } = await api.post('/bunks', payload)
  return data
}
