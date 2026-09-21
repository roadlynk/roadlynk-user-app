import { api } from './api-client'

// GET {{apiBaseUrl}}/users/for-admin?active=true[&companyId=...]
// -> { employee: User[], admin: User[] }
// companyId scopes the result to one client company — required for a CLIENT_ADMIN
// viewer (their own company). Omit it for PROVIDER_ADMIN / PROVIDER_SUPER_ADMIN
// viewers, who see every company's users.
export async function fetchUsersForAdmin({ active, companyId } = {}) {
  const params = { active }
  if (companyId) params.companyId = companyId
  const { data } = await api.get('/users/for-admin', { params })
  return data
}
