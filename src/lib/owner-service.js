import { api } from './api-client'

// GET {{apiBaseUrl}}/owners?companyId=&active=
// -> Owner[]
export async function listOwnersApi({ companyId, active }) {
  const { data } = await api.get('/owners', { params: { companyId, active } })
  return data
}

// POST {{apiBaseUrl}}/owners
// {
//   name, phoneNumber, email, aadharNumber,
//   address: { pincode, state, district, town, fullAddress },
//   companyId, panNumber, gstin, isRental,
//   accountGroup: "ASSET" | "CREDIT",
//   openingBalance, openingBalanceType: "DEBIT" | "CREDIT",
//   tdsTruckNumber: string[], tdsPercentage,
//   tdsCertificateUrl?  // rental owners — URL from POST /images/upload-multiple
// }
export async function createOwnerApi(payload) {
  const { data } = await api.post('/owners', payload)
  return data
}

// PATCH {{apiBaseUrl}}/owners/:ownerId — same payload shape as create (without
// companyId), or a partial payload.
export async function updateOwnerApi(ownerId, payload) {
  const { data } = await api.patch(`/owners/${ownerId}`, payload)
  return data
}

// PATCH {{apiBaseUrl}}/owners/active-status/:ownerId — { isActive }
export async function updateOwnerActiveStatusApi(ownerId, payload) {
  const { data } = await api.patch(`/owners/active-status/${ownerId}`, payload)
  return data
}
