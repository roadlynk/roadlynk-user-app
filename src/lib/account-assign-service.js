import { api } from './api-client'

// POST {{apiBaseUrl}}/account-assign/filter
// { companyId, consignorId, consignorBranchId }
// -> AccountAssignment[]: each carries an `accountId` that is itself the
// populated cash-account object (not a bare id); empty when nothing is
// assigned for this consignor/branch yet.
export async function filterAccountAssignmentsApi(payload) {
  const { data } = await api.post('/account-assign/filter', payload)
  return data
}

// POST {{apiBaseUrl}}/account-assign — create or update the assignment.
// { companyId, consignorId, consignorBranchId, accountId }
export async function saveAccountAssignmentApi(payload) {
  const { data } = await api.post('/account-assign', payload)
  return data
}
