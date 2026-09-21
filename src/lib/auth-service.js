import { api } from './api-client'
import { clearTokens, clearUser, getAccessToken, getUser, setTokens, setUser } from './token-storage'

// Disabled now that the real /auth/login backend is reachable — kept for
// reference rather than deleted. One account per access role (see
// src/lib/access-control.js) so every combination could be tested:
// CLIENT_EMPLOYEE, CLIENT_ADMIN, PROVIDER_EMPLOYEE, PROVIDER_ADMIN, PROVIDER_SUPER_ADMIN.
// CLIENT_SUPER_ADMIN does not exist in this system, so there is no such demo account.
// const DEMO_ACCOUNTS = [
//   {
//     credentials: { username: 'boopathi', password: 'Boopathi@7!' },
//     session: {
//       accessToken: 'demo-access-token-client-employee',
//       refreshToken: 'demo-refresh-token-client-employee',
//       user: {
//         id: 'demo-user-client-employee',
//         username: 'Boopathi',
//         email: 'boopathi@client.com',
//         mobileNumber: '+91 98765 43210',
//         userCompanyType: 'CLIENT',
//         userRole: 'EMPLOYEE',
//         isActive: true,
//         tokenVersion: 1,
//         companies: [
//           {
//             id: 'demo-company-krnt',
//             companyCode: 'KRNT',
//             companyName: 'Karunya Transport',
//             employeeRole: 'AUDITOR',
//             isActive: true,
//           },
//         ],
//       },
//     },
//   },
//   {
//     credentials: { username: 'clientadmin', password: 'ClientAdmin@1!' },
//     session: {
//       accessToken: 'demo-access-token-client-admin',
//       refreshToken: 'demo-refresh-token-client-admin',
//       user: {
//         id: 'demo-user-client-admin',
//         username: 'Priya',
//         email: 'priya.admin@client.com',
//         mobileNumber: '+91 98765 43211',
//         userCompanyType: 'CLIENT',
//         userRole: 'ADMIN',
//         isActive: true,
//         tokenVersion: 1,
//         companies: [
//           {
//             id: 'demo-company-kpnt',
//             companyCode: 'KPNT',
//             companyName: 'KPN Transport',
//             employeeRole: 'MANAGER',
//             isActive: true,
//           },
//         ],
//       },
//     },
//   },
//   {
//     credentials: { username: 'providerstaff', password: 'ProviderStaff@1!' },
//     session: {
//       accessToken: 'demo-access-token-provider-employee',
//       refreshToken: 'demo-refresh-token-provider-employee',
//       user: {
//         id: 'demo-user-provider-employee',
//         username: 'Arun',
//         email: 'arun.employee@provider.com',
//         mobileNumber: '+91 98765 43212',
//         userCompanyType: 'PROVIDER',
//         userRole: 'EMPLOYEE',
//         isActive: true,
//         tokenVersion: 1,
//         companies: [],
//       },
//     },
//   },
//   {
//     credentials: { username: 'provideradmin', password: 'ProviderAdmin@1!' },
//     session: {
//       accessToken: 'demo-access-token-provider-admin',
//       refreshToken: 'demo-refresh-token-provider-admin',
//       user: {
//         id: 'demo-user-provider-admin',
//         username: 'Manoj',
//         email: 'manoj.admin@provider.com',
//         mobileNumber: '+91 98765 43213',
//         userCompanyType: 'PROVIDER',
//         userRole: 'ADMIN',
//         isActive: true,
//         tokenVersion: 1,
//         companies: [],
//       },
//     },
//   },
//   {
//     credentials: { username: 'superadmin', password: 'SuperAdmin@1!' },
//     session: {
//       accessToken: 'demo-access-token-provider-super-admin',
//       refreshToken: 'demo-refresh-token-provider-super-admin',
//       user: {
//         id: 'demo-user-provider-super-admin',
//         username: 'Karthik',
//         email: 'karthik.superadmin@provider.com',
//         mobileNumber: '+91 98765 43214',
//         userCompanyType: 'PROVIDER',
//         userRole: 'SUPER_ADMIN',
//         isActive: true,
//         tokenVersion: 1,
//         companies: [],
//       },
//     },
//   },
// ]

export async function login(email, password) {
  // const account = DEMO_ACCOUNTS.find((acc) => acc.credentials.username === email && acc.credentials.password === password)
  // if (account) {
  //   setTokens(account.session)
  //   setUser(account.session.user)
  //   return account.session
  // }

  const { data } = await api.post('/auth/login', { email, password })
  setTokens(data)
  setUser(data.user)
  return data
}

export async function logout() {
  // const isDemoSession = DEMO_ACCOUNTS.some((acc) => acc.session.accessToken === getAccessToken())

  try {
    // if (!isDemoSession) {
    await api.post('/auth/logout')
    // }
  } catch {
    // Best-effort: the server call may fail (network down, token already
    // expired, etc.) but the local session should still be cleared.
  } finally {
    clearTokens()
    clearUser()
  }
}

export async function getLoggedInUser() {
  const { data } = await api.get('/auth/me')
  setUser(data)
  return data
}

export async function changePassword(currentPassword, newPassword) {
  // const account = DEMO_ACCOUNTS.find((acc) => acc.session.accessToken === getAccessToken())
  // if (account) {
  //   if (account.credentials.password !== currentPassword) {
  //     throw new Error('Current password is incorrect.')
  //   }
  //   account.credentials.password = newPassword
  //   return { success: true }
  // }

  const { data } = await api.patch('/auth/change-password', { currentPassword, newPassword })
  return data
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}

export function getCurrentUser() {
  return getUser()
}
