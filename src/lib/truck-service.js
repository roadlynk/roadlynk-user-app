import { api } from './api-client'

// GET {{apiBaseUrl}}/trucks?companyId=&active=
// -> Truck[] (each truck includes a nested `owner` object)
export async function listTrucksApi({ companyId, active }) {
  const { data } = await api.get('/trucks', { params: { companyId, active } })
  return data
}

// POST {{apiBaseUrl}}/trucks
// {
//   truckNumber, chasisNumber, capacity, wheelType, fuelTankCapacity,
//   horsePower, manufacturer, manufacturingYear, companyId, ownerId,
//   certificate: {
//     fitnessCertificate, permitDate, insurance, pollutionCertificate, taxCertificate
//   } — each an optional { fromDate, toDate } pair
// }
export async function createTruckApi(payload) {
  const { data } = await api.post('/trucks', payload)
  return data
}

// PATCH {{apiBaseUrl}}/trucks/:truckId — same payload shape as create, without companyId.
export async function updateTruckApi(truckId, payload) {
  const { data } = await api.patch(`/trucks/${truckId}`, payload)
  return data
}

// PATCH {{apiBaseUrl}}/trucks/active-status
// { truckIds: string[], isActive: boolean }
export async function updateTrucksActiveStatusApi(payload) {
  const { data } = await api.patch('/trucks/active-status', payload)
  return data
}
