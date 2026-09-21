import { createDummyStore } from './dummy-store'
import { listDummyOwners } from './dummy-owners-api'

// TODO: remove once the real GET/POST/PATCH /trucks backend is reachable —
// lets the demo keep working end-to-end without a running API.
// Not filtered by companyId in this fallback (same convention as the other
// dummy list fixtures in this app) — just a fixed sample set per active state.

const MOORTHY_OWNER = {
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
  tdsTruckNumber: ['T1', 'T2', 'T3', 'T5', 'T6', 'T7', 'T8', 'T4', 'T9', 'T10'],
  tdsPercentage: 0,
  isActive: true,
  createdAt: '2026-09-13T14:50:23.221Z',
  updatedAt: '2026-09-13T18:28:23.125Z',
  __v: 0,
  tdsCertificateUrl: 'yes',
}

const SIVAKUMAR_OWNER = {
  _id: '6aa6b79e5f713ee48200b66a',
  name: 'Sivakumar M S',
  phoneNumber: '9876543210',
  email: 'owner@example.com',
  aadharNumber: '123456789012',
  address: {
    pincode: '400001',
    state: 'Maharashtra',
    district: 'Mumbai',
    town: 'Mumbai',
    fullAddress: '1 Example Road, Mumbai',
  },
  companyId: '6aa3b2553498aa0d37e43579',
  panNumber: 'ABCDE1234F',
  gstin: '27ABCDE1234F1Z5',
  isRental: false,
  accountGroup: 'ASSET',
  openingBalance: 0,
  openingBalanceType: 'DEBIT',
  tdsTruckNumber: ['T9', 'T7'],
  tdsPercentage: 0,
  isActive: true,
  createdAt: '2026-09-13T14:47:58.947Z',
  updatedAt: '2026-09-13T15:05:36.597Z',
  __v: 0,
}

export const DUMMY_TRUCKS_ACTIVE_RESPONSE = [
  {
    _id: '6aa6e6257ee8460ba8ba79db',
    truckNumber: 'T1',
    chasisNumber: 'MA1XYZ123456789000',
    capacity: 16,
    wheelType: 10,
    fuelTankCapacity: 300,
    horsePower: 220,
    manufacturer: 'MAHENDRA',
    manufacturingYear: 2024,
    companyId: '6aa3b2553498aa0d37e43579',
    ownerId: '6aa6b82f5f713ee48200b66c',
    isActive: true,
    createdAt: '2026-09-13T18:06:29.507Z',
    updatedAt: '2026-09-13T18:06:29.507Z',
    __v: 0,
    owner: MOORTHY_OWNER,
  },
  {
    _id: '6aa6e7a21407006c6c3378c5',
    truckNumber: 'T10',
    chasisNumber: 'T11111',
    capacity: 16,
    wheelType: 10,
    fuelTankCapacity: 300,
    horsePower: 220,
    manufacturer: 'MAHENDRA',
    manufacturingYear: 2024,
    companyId: '6aa3b2553498aa0d37e43579',
    ownerId: '6aa6b82f5f713ee48200b66c',
    isActive: true,
    createdAt: '2026-09-13T18:12:50.799Z',
    updatedAt: '2026-09-13T18:12:50.799Z',
    __v: 0,
    owner: MOORTHY_OWNER,
  },
  {
    _id: '6aa6e3987ee8460ba8ba79d5',
    truckNumber: 'TN01AB1234',
    chasisNumber: 'MA1XYZ12345678901',
    capacity: 18,
    wheelType: 10,
    fuelTankCapacity: 350,
    horsePower: 220,
    manufacturer: 'TATA',
    manufacturingYear: 2024,
    companyId: '6aa3b2553498aa0d37e43579',
    ownerId: '6aa6b79e5f713ee48200b66a',
    isActive: true,
    createdAt: '2026-09-13T17:55:36.041Z',
    updatedAt: '2026-09-13T18:01:35.136Z',
    __v: 0,
    owner: SIVAKUMAR_OWNER,
  },
  {
    _id: '6aa6e3c17ee8460ba8ba79d9',
    truckNumber: 'TN01AB1235',
    chasisNumber: 'MA1XYZ12345678902',
    capacity: 16,
    wheelType: 10,
    fuelTankCapacity: 300,
    horsePower: 220,
    manufacturer: 'MAHENDRA',
    manufacturingYear: 2024,
    companyId: '6aa3b2553498aa0d37e43579',
    ownerId: '6aa6b82f5f713ee48200b66c',
    isActive: true,
    createdAt: '2026-09-13T17:56:17.650Z',
    updatedAt: '2026-09-13T17:56:17.650Z',
    __v: 0,
    owner: MOORTHY_OWNER,
  },
]

export const DUMMY_TRUCKS_INACTIVE_RESPONSE = [
  {
    _id: '6aa6e8b71407006c6c3378d2',
    truckNumber: 'TN01AB9999',
    chasisNumber: 'MA1XYZ99999999999',
    capacity: 16,
    wheelType: 10,
    fuelTankCapacity: 300,
    horsePower: 220,
    manufacturer: 'ASHOK_LEYLAND',
    manufacturingYear: 2020,
    companyId: '6aa3b2553498aa0d37e43579',
    ownerId: '6aa6b79e5f713ee48200b66a',
    isActive: false,
    createdAt: '2026-05-10T09:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
    __v: 0,
    owner: SIVAKUMAR_OWNER,
  },
]

const trucksStore = createDummyStore([...DUMMY_TRUCKS_ACTIVE_RESPONSE, ...DUMMY_TRUCKS_INACTIVE_RESPONSE])

export function listDummyTrucks({ active } = {}) {
  const items = trucksStore.list()
  return active === undefined ? items : items.filter((item) => item.isActive === active)
}

export function createDummyTruck(payload) {
  const owner = listDummyOwners().find((item) => item._id === payload.ownerId) ?? null
  return trucksStore.add({
    ...payload,
    _id: `truck-${crypto.randomUUID()}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
    owner,
  })
}

export function updateDummyTruck(truckId, payload) {
  const owner = payload.ownerId ? listDummyOwners().find((item) => item._id === payload.ownerId) ?? null : undefined
  return trucksStore.update(truckId, {
    ...payload,
    ...(owner !== undefined ? { owner } : {}),
    updatedAt: new Date().toISOString(),
  })
}

export function updateDummyTrucksActiveStatus(truckIds, isActive) {
  return truckIds.map((truckId) => trucksStore.update(truckId, { isActive, updatedAt: new Date().toISOString() }))
}
