import { api } from './api-client'

// POST {{apiBaseUrl}}/users
// { username, email, password, userCompanyType, userRole, companyId?, employeeRoles? }
export async function createUser(payload) {
  const { data } = await api.post('/users', payload)
  return data
}

// PATCH {{apiBaseUrl}}/users/active-status/:userId
// { isActive, companyId? } -> { id, isActive }
// companyId is required whenever the target is a client user (Client Admin /
// client employee) — the company they belong to; omitted for provider
// employees, who have none.
export async function setUserActiveStatus(userId, isActive, companyId) {
  const payload = companyId ? { isActive, companyId } : { isActive }
  const { data } = await api.patch(`/users/active-status/${userId}`, payload)
  return data
}

// PATCH {{apiBaseUrl}}/users/roles/:userId
// Used to edit any existing login — admin or employee.
// { username, email, password?, employeeRoles?, removedRoles?, companyId? }
// - Admin (Client Admin) edits: no employeeRoles/removedRoles — admins don't
//   have roles — just companyId (their tagged organisation).
// - PROVIDER employee edits: employeeRoles + removedRoles, no companyId.
//   removedRoles tells the backend which role(s) to unassign, which it
//   validates aren't still held via an active company membership (e.g.
//   "User is still assigned to the following companies with roles [...]").
// - CLIENT employee edits: employeeRoles + companyId, no removedRoles —
//   scoped to one company, so there's no cross-company membership to check.
export async function updateEmployeeRoles(userId, payload) {
  const { data } = await api.patch(`/users/roles/${userId}`, payload)
  return data
}
