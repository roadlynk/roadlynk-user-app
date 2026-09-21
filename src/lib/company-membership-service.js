import { api } from './api-client'

// GET {{apiBaseUrl}}/company-memberships/assign-users/:companyId
// -> {
//   users: { MANAGER: User[], AUDITOR: User[] },       // candidate pool per role
//   assignedUsers: { MANAGER: string[], AUDITOR: string[] }, // user _ids already assigned per role
// }
export async function fetchAssignUsersData(companyId) {
  const { data } = await api.get(`/company-memberships/assign-users/${companyId}`)
  return data
}

// POST {{apiBaseUrl}}/company-memberships/assign
// { companyId, MANAGER: string[], AUDITOR: string[] }
// Always send the full current membership per role (not just what changed) —
// the backend replaces each role's assignment list wholesale.
export async function saveCompanyMemberships(companyId, assignedIdsByRole) {
  const { data } = await api.post('/company-memberships/assign', { companyId, ...assignedIdsByRole })
  return data
}
