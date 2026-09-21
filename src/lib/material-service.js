import { api } from './api-client'

// GET {{apiBaseUrl}}/materials?companyId=&active= -> Material[]
export async function listMaterialsApi({ companyId, active } = {}) {
  const { data } = await api.get('/materials', { params: { companyId, active } })
  return data
}

// POST {{apiBaseUrl}}/materials
// {
//   companyId, material, category: string[], quantityType,
//   materialSpecificFields: [{ fieldName, fieldType }]
// }
export async function createMaterialApi(payload) {
  const { data } = await api.post('/materials', payload)
  return data
}

// PATCH {{apiBaseUrl}}/materials/:materialId — same payload shape as create.
export async function updateMaterialApi(materialId, payload) {
  const { data } = await api.patch(`/materials/${materialId}`, payload)
  return data
}

// PATCH {{apiBaseUrl}}/materials/active-status/:materialId — { isActive }
export async function updateMaterialActiveStatusApi(materialId, payload) {
  const { data } = await api.patch(`/materials/active-status/${materialId}`, payload)
  return data
}
