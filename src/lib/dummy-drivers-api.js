import { createDummyStore } from './dummy-store'

// TODO: remove once the real GET/POST/PATCH /drivers backend is reachable —
// lets the demo keep working end-to-end without a running API.
// Not filtered by companyId in this fallback (same convention as the other
// dummy list fixtures in this app) — just a fixed sample set per active state.

export const DUMMY_DRIVERS_ACTIVE_RESPONSE = [
  {
    _id: '6aa81c6cee60b052dd525b6d',
    name: 'Murali',
    licenceNumber: 'TN0120200001234',
    licenceExpiryDate: '2028-12-31T00:00:00.000Z',
    mobileNumber: '9876543210',
    licenceImageUrl: 'https://example.com/licences/murali.jpg',
    companyId: '6aa3b2553498aa0d37e43579',
    isActive: true,
    createdAt: '2026-09-14T16:10:20.854Z',
    updatedAt: '2026-09-14T16:10:20.854Z',
    __v: 0,
  },
  {
    _id: '6aa81c84ee60b052dd525b6f',
    name: 'Manikandan',
    licenceNumber: 'TN0120200001235',
    licenceExpiryDate: '2028-12-31T00:00:00.000Z',
    mobileNumber: '9876543211',
    licenceImageUrl: 'https://example.com/licences/manikandan.jpg',
    companyId: '6aa3b2553498aa0d37e43579',
    isActive: true,
    createdAt: '2026-09-14T16:10:44.167Z',
    updatedAt: '2026-09-14T16:17:01.052Z',
    __v: 0,
  },
]

export const DUMMY_DRIVERS_INACTIVE_RESPONSE = [
  {
    _id: '6aa81cd0ee60b052dd525b74',
    name: 'Elumalai R (disabled)',
    licenceNumber: 'TN37201800098765',
    licenceExpiryDate: '2025-11-02T00:00:00.000Z',
    mobileNumber: '9876554321',
    licenceImageUrl: 'https://example.com/licences/elumalai.jpg',
    companyId: '6aa3b2553498aa0d37e43579',
    isActive: false,
    createdAt: '2026-04-18T06:40:00.000Z',
    updatedAt: '2026-07-30T13:22:09.000Z',
    __v: 0,
  },
]

const driversStore = createDummyStore([...DUMMY_DRIVERS_ACTIVE_RESPONSE, ...DUMMY_DRIVERS_INACTIVE_RESPONSE])

export function listDummyDrivers({ active } = {}) {
  const items = driversStore.list()
  return active === undefined ? items : items.filter((item) => item.isActive === active)
}

export function createDummyDriver(payload) {
  return driversStore.add({
    ...payload,
    _id: `driver-${crypto.randomUUID()}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  })
}

export function updateDummyDriver(driverId, payload) {
  return driversStore.update(driverId, { ...payload, updatedAt: new Date().toISOString() })
}

export function updateDummyDriverActiveStatus(driverId, isActive) {
  return driversStore.update(driverId, { isActive, updatedAt: new Date().toISOString() })
}
