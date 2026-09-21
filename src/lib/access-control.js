// Centralizes "who can see what" based on the logged-in user's
// userCompanyType (CLIENT | PROVIDER) and userRole (SUPER_ADMIN | ADMIN | EMPLOYEE).

export const COMPANY_TYPE = {
  CLIENT: 'CLIENT',
  PROVIDER: 'PROVIDER',
}

export const USER_ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
}

// Combined "<companyType>_<role>" identity, e.g. CLIENT_ADMIN, PROVIDER_SUPER_ADMIN.
// Note: CLIENT_SUPER_ADMIN is not a role that exists in this system — SUPER_ADMIN
// only occurs on the PROVIDER side.
export const ACCESS_ROLE = {
  CLIENT_EMPLOYEE: 'CLIENT_EMPLOYEE',
  CLIENT_ADMIN: 'CLIENT_ADMIN',
  PROVIDER_EMPLOYEE: 'PROVIDER_EMPLOYEE',
  PROVIDER_ADMIN: 'PROVIDER_ADMIN',
  PROVIDER_SUPER_ADMIN: 'PROVIDER_SUPER_ADMIN',
}

// Pages in the app, independent of their route paths.
export const PAGE = {
  PROFILE: 'PROFILE',
  COMPANIES: 'COMPANIES',
  COMPANY_CREATE: 'COMPANY_CREATE',
  COMPANY_LIST: 'COMPANY_LIST',
  USERS_ROLES: 'USERS_ROLES',
  GST_CONFIGURER: 'GST_CONFIGURER',
}

// Route paths each page owns (prefix-matched, so nested routes like
// /companies/:id/users or /company-list/:id inherit their parent's access).
export const PAGE_ROUTES = {
  [PAGE.PROFILE]: ['/profile'],
  [PAGE.COMPANIES]: ['/companies'],
  [PAGE.COMPANY_CREATE]: ['/companies/new'],
  [PAGE.COMPANY_LIST]: ['/company-list'],
  [PAGE.USERS_ROLES]: ['/users'],
  [PAGE.GST_CONFIGURER]: ['/masters/gst-configurer'],
}

const ALL_PAGES = Object.values(PAGE)

// Employees only ever see the company list, no matter which company type they
// belong to. CLIENT admins get the company list plus users & roles, but the
// Companies page (and therefore company creation) and the Masters section
// (GST Configurer) are PROVIDER-only areas. PROVIDER admins/super-admins see
// everything. CLIENT_SUPER_ADMIN is intentionally absent — that combination
// doesn't occur in this system.
const PAGE_ACCESS_BY_ROLE = {
  [ACCESS_ROLE.CLIENT_EMPLOYEE]: [PAGE.PROFILE, PAGE.COMPANY_LIST],
  [ACCESS_ROLE.PROVIDER_EMPLOYEE]: [PAGE.PROFILE, PAGE.COMPANY_LIST],
  [ACCESS_ROLE.CLIENT_ADMIN]: [PAGE.PROFILE, PAGE.COMPANY_LIST, PAGE.USERS_ROLES],
  [ACCESS_ROLE.PROVIDER_ADMIN]: ALL_PAGES,
  [ACCESS_ROLE.PROVIDER_SUPER_ADMIN]: ALL_PAGES,
}

/**
 * Combines userCompanyType + userRole into one access role, e.g. "CLIENT_ADMIN".
 */
export function getAccessRole(user) {
  const userCompanyType = user?.userCompanyType
  const userRole = user?.userRole
  if (!userCompanyType || !userRole) return null
  return `${userCompanyType}_${userRole}`
}

/**
 * Returns the list of PAGE keys the given user is allowed to see.
 * Falls back to profile-only access for unrecognized/incomplete users.
 */
export function getAllowedPages(user) {
  const accessRole = getAccessRole(user)
  return PAGE_ACCESS_BY_ROLE[accessRole] ?? [PAGE.PROFILE]
}

export function canAccessPage(user, page) {
  return getAllowedPages(user).includes(page)
}

/**
 * Resolves which PAGE a given pathname belongs to (longest route match wins),
 * then checks whether the user can access it. Unknown paths are denied.
 */
export function canAccessRoute(user, pathname) {
  const page = Object.entries(PAGE_ROUTES)
    .filter(([, routes]) => routes.some((route) => pathname === route || pathname.startsWith(`${route}/`)))
    .sort((a, b) => b[1][0].length - a[1][0].length)[0]?.[0]

  return page ? canAccessPage(user, page) : false
}

// The company workspace's "Profile" tab (view/edit company details + bank
// accounts) is restricted to provider admins/super-admins, unlike the rest of
// that workspace which employees and client admins can also use.
const COMPANY_PROFILE_ROLES = [ACCESS_ROLE.PROVIDER_ADMIN, ACCESS_ROLE.PROVIDER_SUPER_ADMIN]

export function canManageCompanyProfile(user) {
  return COMPANY_PROFILE_ROLES.includes(getAccessRole(user))
}
