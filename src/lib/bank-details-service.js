import { api } from './api-client'

export const HOLDER_TYPES = {
  COMPANY: 'COMPANY',
  OWNER: 'OWNER',
  DRIVER: 'DRIVER',
}

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CURRENT', label: 'Current' },
]

// GET {{apiBaseUrl}}/bank-details?holderId=&holderType=&companyId=
// -> BankDetail[]
export async function listBankDetailsApi({ holderId, holderType, companyId }) {
  const { data } = await api.get('/bank-details', { params: { holderId, holderType, companyId } })
  return data
}

// POST {{apiBaseUrl}}/bank-details
// {
//   bankName, accountNumber, ifscCode, branchName, accountType,
//   holderType, holderId, companyId,
//   isRental  // only when holderType === 'OWNER'
// }
export async function createBankDetailApi(payload) {
  const { data } = await api.post('/bank-details', payload)
  return data
}

// PATCH {{apiBaseUrl}}/bank-details/active
// { holderId, holderType, companyId, bankDetailsId, isRental? }
// isRental is only sent when holderType === 'OWNER'.
export async function activateBankDetailApi(payload) {
  const { data } = await api.patch('/bank-details/active', payload)
  return data
}

// PATCH {{apiBaseUrl}}/bank-details/deactivate
// { holderType, holderId, companyId, bankDetailsId, isRental? }
// Only offered for holders that can have several active accounts at once
// (a company, or a non-rental owner). isRental is only sent when
// holderType === 'OWNER'.
export async function deactivateBankDetailApi(payload) {
  const { data } = await api.patch('/bank-details/deactivate', payload)
  return data
}
