import { api } from './api-client'

export const CASH_ACCOUNT_TYPE = {
  PETTY_CASH: 'PETTY_CASH',
  ADJUSTMENT: 'ADJUSTMENT',
}

// GET {{apiBaseUrl}}/cash-accounts?companyId=...&active=true
// -> CashAccount[]: { _id, companyId, name, type, isActive, createdAt, updatedAt }
export async function listCashAccountsApi({ companyId, active }) {
  const { data } = await api.get('/cash-accounts', { params: { companyId, active } })
  return data
}

// POST {{apiBaseUrl}}/cash-accounts
// { companyId, name, type }
export async function createCashAccountApi(payload) {
  const { data } = await api.post('/cash-accounts', payload)
  return data
}
