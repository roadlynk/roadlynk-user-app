import { api } from './api-client'

// POST {{apiBaseUrl}}/bunk-assign/filter
// { companyId, consignorId, consignorBranchId }
// -> BunkAssignment[]: each carries bunkId plus an embedded `bunk` object;
// empty when nothing is assigned for this consignor/branch yet.
export async function filterBunkAssignmentsApi(payload) {
  const { data } = await api.post('/bunk-assign/filter', payload)
  return data
}

// POST {{apiBaseUrl}}/bunk-assign — create or update the assignment.
// { companyId, consignorId, consignorBranchId, bunkId }
export async function saveBunkAssignmentApi(payload) {
  const { data } = await api.post('/bunk-assign', payload)
  return data
}
