import { api } from './api-client'

// GET {{apiBaseUrl}}/companies?active=true&page=1&limit=5
// -> { data: Company[], total, currentPage, totalPages }
export async function listCompanies({ active, page = 1, limit = 5 } = {}) {
  const { data } = await api.get('/companies', { params: { active, page, limit } })
  return data
}

// GET {{apiBaseUrl}}/companies/saas-clients -> Company[]
// Only companies flagged isSaasClient: true — the ones an Admin/Client Admin
// login can be tagged to. Used to populate that company-selection dropdown.
export async function listSaasClientCompanies() {
  const { data } = await api.get('/companies/saas-clients')
  return data
}

// POST {{apiBaseUrl}}/companies
// {
//   "companyCode": "KPNT",
//   "companyName": "KPN Transport",
//   "contactEmail": "contact@kpnt.com",
//   "contactNumber": "8796736521",
//   "gstin": "17ABCDE1234F1Z5",
//   "pan": "ABCDE1234X",
//   "address": { "pincode": "636001", "state": "Tamil Nadu", "district": "Chennai", "town": "Anna Nagar", "fullAddress": "KPN office Chennai" },
//   "internalNotes": "Initial client account",
//   "isSaasClient": false
// }
export async function createCompany(payload) {
  const { data } = await api.post('/companies', payload)
  return data
}

// PATCH {{apiBaseUrl}}/companies/:companyId — same payload shape as create.
export async function updateCompany(companyId, payload) {
  const { data } = await api.patch(`/companies/${companyId}`, payload)
  return data
}

// PATCH {{apiBaseUrl}}/companies/active-status/:companyId
// { "isActive": true } -> { id, isActive }
export async function setCompanyActiveStatus(companyId, isActive) {
  const { data } = await api.patch(`/companies/active-status/${companyId}`, { isActive })
  return data
}
