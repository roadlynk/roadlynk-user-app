// TODO: remove once the real GET /users/for-admin backend is reachable — lets
// the demo keep working end-to-end without a running API. Four fixtures cover
// the combinations the UI can request: scoped to one client company (what a
// CLIENT_ADMIN sees) vs every company (what a PROVIDER_ADMIN / PROVIDER_SUPER_ADMIN
// sees), each for active and inactive logins.

// Scoped to Karunya Transport (companyId 6aa3b32e3498aa0d37e4357e), active=true.
export const DUMMY_USERS_FOR_ADMIN_SCOPED_ACTIVE = {
  employee: [
    {
      _id: '6aa4f9680ccc4c8c4f96a45b',
      username: 'ALL1',
      email: 'all.employee@provider.com',
      userCompanyType: 'PROVIDER',
      userRole: 'EMPLOYEE',
      employeeRoles: ['MANAGER', 'AUDITOR'],
      isActive: true,
      companies: [{ id: '6aa3b2553498aa0d37e43579', companyName: 'M S Transport' }],
    },
    {
      _id: '6aa4f9740ccc4c8c4f96a45d',
      username: 'ALL2',
      email: 'all2.employee@provider.com',
      userCompanyType: 'PROVIDER',
      userRole: 'EMPLOYEE',
      employeeRoles: ['MANAGER', 'AUDITOR'],
      isActive: true,
      companies: [{}],
    },
    {
      _id: '6aa4f9340ccc4c8c4f96a452',
      username: 'AUDITOR 1',
      email: 'auditor.employee@provider.com',
      userCompanyType: 'PROVIDER',
      userRole: 'EMPLOYEE',
      employeeRoles: ['AUDITOR'],
      isActive: true,
      companies: [{}],
    },
    {
      _id: '6aa4f93e0ccc4c8c4f96a455',
      username: 'AUDITOR 2',
      email: 'auditor2.employee@provider.com',
      userCompanyType: 'PROVIDER',
      userRole: 'EMPLOYEE',
      employeeRoles: ['AUDITOR'],
      isActive: true,
      companies: [{}],
    },
    {
      _id: '6aa4f9550ccc4c8c4f96a459',
      username: 'MANAGER 1',
      email: 'manager1.employee@provider.com',
      userCompanyType: 'PROVIDER',
      userRole: 'EMPLOYEE',
      employeeRoles: ['MANAGER'],
      isActive: true,
      companies: [{ id: '6aa3b2553498aa0d37e43579', companyName: 'M S Transport' }],
    },
    {
      _id: '6aa4f94e0ccc4c8c4f96a457',
      username: 'MANAGER 2',
      email: 'manager2.employee@provider.com',
      userCompanyType: 'PROVIDER',
      userRole: 'EMPLOYEE',
      employeeRoles: ['MANAGER'],
      isActive: true,
      companies: [{}],
    },
    {
      _id: '6aa3e4860078a236719ade5f',
      username: 'Ramesh',
      email: 'ramesh.employee@provider.com',
      userCompanyType: 'PROVIDER',
      userRole: 'EMPLOYEE',
      employeeRoles: ['MANAGER', 'AUDITOR'],
      isActive: true,
      companies: [{}],
    },
    {
      _id: '6aa3e4670078a236719ade5d',
      username: 'Santhosh',
      email: 'santhosh.employee@provider.com',
      userCompanyType: 'PROVIDER',
      userRole: 'EMPLOYEE',
      employeeRoles: ['MANAGER'],
      isActive: true,
      companies: [{}],
    },
  ],
  admin: [
    {
      _id: '6aa3b4025880ea617f38c2d1',
      username: 'Gowtham',
      email: 'gowtham.admin@client.com',
      userCompanyType: 'CLIENT',
      userRole: 'ADMIN',
      employeeRoles: [],
      isActive: true,
      companies: [{ id: '6aa3b32e3498aa0d37e4357e', companyName: 'Karunya Transport' }],
    },
  ],
}

// Scoped to Karunya Transport, active=false.
export const DUMMY_USERS_FOR_ADMIN_SCOPED_INACTIVE = {
  employee: [
    {
      _id: '6aa4f9340ccc4c8c4f96a453',
      username: 'Vetri',
      email: 'vetri.employee@provider.com',
      userCompanyType: 'PROVIDER',
      userRole: 'EMPLOYEE',
      employeeRoles: ['AUDITOR'],
      isActive: false,
      companies: [{ id: '6aa3b32e3498aa0d37e4357e', companyName: 'Karunya Transport' }],
    },
  ],
  admin: [
    {
      _id: '6aa3b4025880ea617f38c2d2',
      username: 'Latha',
      email: 'latha.admin@client.com',
      userCompanyType: 'CLIENT',
      userRole: 'ADMIN',
      employeeRoles: [],
      isActive: false,
      companies: [{ id: '6aa3b32e3498aa0d37e4357e', companyName: 'Karunya Transport' }],
    },
  ],
}

// Unscoped (every company), active=true — what PROVIDER_ADMIN / PROVIDER_SUPER_ADMIN see.
export const DUMMY_USERS_FOR_ADMIN_ALL_ACTIVE = {
  employee: [
    ...DUMMY_USERS_FOR_ADMIN_SCOPED_ACTIVE.employee,
    {
      _id: '6aa4f9340ccc4c8c4f96a460',
      username: 'Priya',
      email: 'priya.employee@client.com',
      userCompanyType: 'CLIENT',
      userRole: 'EMPLOYEE',
      employeeRoles: ['MANAGER'],
      isActive: true,
      companies: [{ id: '6aa43685f34e6afd45a8d031', companyName: 'KPN Transport' }],
    },
  ],
  admin: [
    ...DUMMY_USERS_FOR_ADMIN_SCOPED_ACTIVE.admin,
    {
      _id: '6aa3e5540078a236719ade74',
      username: 'Karthik',
      email: 'karthik.admin@provider.com',
      userCompanyType: 'CLIENT',
      userRole: 'ADMIN',
      employeeRoles: [],
      isActive: true,
      companies: [{ id: '6aa3b2553498aa0d37e43579', companyName: 'M S Transport' }],
    },
  ],
}

// Unscoped (every company), active=false.
export const DUMMY_USERS_FOR_ADMIN_ALL_INACTIVE = {
  employee: [
    ...DUMMY_USERS_FOR_ADMIN_SCOPED_INACTIVE.employee,
    {
      _id: '6aa4f9340ccc4c8c4f96a461',
      username: 'Arun',
      email: 'arun.employee@client.com',
      userCompanyType: 'CLIENT',
      userRole: 'EMPLOYEE',
      employeeRoles: ['AUDITOR'],
      isActive: false,
      companies: [{ id: '6aa3b2553498aa0d37e43579', companyName: 'M S Transport' }],
    },
  ],
  admin: [...DUMMY_USERS_FOR_ADMIN_SCOPED_INACTIVE.admin],
}
