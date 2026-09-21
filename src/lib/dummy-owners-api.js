import { createDummyStore } from './dummy-store'

// TODO: remove once the real GET/POST/PATCH /owners backend is reachable —
// lets the demo keep working end-to-end without a running API.
// Not filtered by companyId in this fallback (same convention as the other
// dummy list fixtures in this app) — just a fixed sample set per active state.

export const DUMMY_OWNERS_ACTIVE_RESPONSE = {
  data: [
    {
      _id: '6aa6b82f5f713ee48200b66c',
      name: 'Moorthy',
      phoneNumber: '9876543214',
      email: 'rent_moorthy@example.com',
      aadharNumber: '1234567890155',
      address: {
        pincode: '400001',
        state: 'Maharashtra',
        district: 'Mumbai',
        town: 'Mumbai',
        fullAddress: '1 Example Road, Mumbai',
      },
      companyId: '6aa3b2553498aa0d37e43579',
      panNumber: 'ABCDE1234Y',
      gstin: '27ABCDE1234F1ZY',
      isRental: true,
      accountGroup: 'CREDIT',
      openingBalance: 0,
      openingBalanceType: 'DEBIT',
      tdsTruckNumber: [],
      tdsPercentage: 1,
      isActive: true,
      createdAt: '2026-09-13T14:50:23.221Z',
      updatedAt: '2026-09-13T14:50:23.221Z',
      __v: 0,
    },
    {
      _id: '6aa6b8a05f713ee48200b671',
      name: 'Karunya Fleet Owners Co-op',
      phoneNumber: '9876500011',
      email: 'fleet@karunyatransport.example.com',
      aadharNumber: '234567891234',
      address: {
        pincode: '641114',
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        town: 'Madawarayapuram',
        fullAddress: 'Karunya Transport Madawarayapuram',
      },
      companyId: '6aa3b32e3498aa0d37e4357e',
      panNumber: 'AACCK1234C',
      gstin: '33AACCK1234C1Z8',
      isRental: false,
      accountGroup: 'ASSET',
      openingBalance: 50000,
      openingBalanceType: 'CREDIT',
      tdsTruckNumber: [],
      tdsPercentage: 0,
      isActive: true,
      createdAt: '2026-06-02T09:20:11.000Z',
      updatedAt: '2026-06-02T09:20:11.000Z',
      __v: 0,
    },
  ],
}

export const DUMMY_OWNERS_INACTIVE_RESPONSE = {
  data: [
    {
      _id: '6aa6b8d05f713ee48200b678',
      name: 'Selvam Logistics (disabled)',
      phoneNumber: '9843211122',
      email: 'selvam.owner@example.com',
      aadharNumber: '345678912345',
      address: {
        pincode: '641114',
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        town: 'Coimbatore',
        fullAddress: 'No 12, Mill Road, Coimbatore',
      },
      companyId: '6aa3b32e3498aa0d37e4357e',
      panNumber: 'ABCDP1234F',
      gstin: '33ABCDP1234F1Z5',
      isRental: true,
      accountGroup: 'CREDIT',
      openingBalance: 25000,
      openingBalanceType: 'CREDIT',
      tdsTruckNumber: ['TN37AB1234'],
      tdsPercentage: 1,
      isActive: false,
      createdAt: '2026-04-18T06:40:00.000Z',
      updatedAt: '2026-07-30T13:22:09.000Z',
      __v: 0,
    },
  ],
}

const ownersStore = createDummyStore([...DUMMY_OWNERS_ACTIVE_RESPONSE.data, ...DUMMY_OWNERS_INACTIVE_RESPONSE.data])

export function listDummyOwners({ active } = {}) {
  const items = ownersStore.list()
  return active === undefined ? items : items.filter((item) => item.isActive === active)
}

export function createDummyOwner(payload) {
  return ownersStore.add({
    ...payload,
    _id: `owner-${crypto.randomUUID()}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  })
}

export function updateDummyOwnerActiveStatus(ownerId, isActive) {
  return ownersStore.update(ownerId, { isActive, updatedAt: new Date().toISOString() })
}

export function updateDummyOwner(ownerId, payload) {
  return ownersStore.update(ownerId, { ...payload, updatedAt: new Date().toISOString() })
}
