import { api } from './api-client'

// POST {{apiBaseUrl}}/transport-rates/filter
// { companyId, consignorId, consignorBranchId, consigneeId, dealerId, materialId }
// -> TransportRate[] (the full history for this combination — the current
// one has isActive: true and effectiveTo: null)
export async function filterTransportRatesApi(payload) {
  const { data } = await api.post('/transport-rates/filter', payload)
  return data
}

// POST {{apiBaseUrl}}/transport-rates
// {
//   companyId, consignorId, consignorBranchId, consigneeId, dealerId, materialId,
//   tonnageRate: [{ fromLimit, toLimit, transportRate: number[] }],
//   effectiveFrom, calculatedDistance, companyDistance, isActive,
// }
export async function createTransportRateApi(payload) {
  const { data } = await api.post('/transport-rates', payload)
  return data
}

// POST {{apiBaseUrl}}/transport-rates/get-transport-rate-and-location
// { companyId, consignorId, consignorBranchId, consigneeId, dealerId, materialId, truckCapacity, loadCapacity }
// -> { finalTransportRate, calculatedDistance, companyDistance }
export async function getTransportRateAndLocationApi(payload) {
  const { data } = await api.post('/transport-rates/get-transport-rate-and-location', payload)
  return data
}
