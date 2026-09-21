import { api } from './api-client'
import { uploadImageApi } from './image-service'

// GET {{apiBaseUrl}}/delivery-challans?companyId=&page=&limit=&active=
// -> { data: DeliveryChallan[], total, currentPage, totalPages }
export async function listDeliveryChallansApi({ companyId, page = 1, limit = 20, active } = {}) {
  const { data } = await api.get('/delivery-challans', { params: { companyId, page, limit, active } })
  return data
}

// POST {{apiBaseUrl}}/delivery-challans
// {
//   companyId,
//   companyDetails: { invoice, shipmentNumber, date },
//   consignment: { consignorId, consignorBranchId, consigneeId, consigneeBranchId, bunkName, account },
//   dealerDetails: { invoiceDealerId, shipToDealerId, isSame },
//   truckDetails: { truckId, driverId },
//   material: { materialId, deliveryCategory, loadingQuantity, dynamicFields },
//   rate: { transportRate, transportIncentive, biddingAmount, totalTransportRate },
//   distance: { odomenterImageUrl, odometerDistance, calculatedDistance, companyDistance },
//   advance: { cashAdvance, dieselAdvance, bankAdvance, isPaymentDone, totalAdvance },
//   additionalInformation: { notes },
// }
export async function createDeliveryChallanApi(payload) {
  const { data } = await api.post('/delivery-challans', payload)
  return data
}

// PATCH {{apiBaseUrl}}/delivery-challans/:id — same payload shape as create.
export async function updateDeliveryChallanApi(id, payload) {
  const { data } = await api.patch(`/delivery-challans/${id}`, payload)
  return data
}

// POST {{apiBaseUrl}}/delivery-challans/filter?page=&limit=
// {
//   companyId,
//   companyDetails?: { invoice?, shipmentNumber?, fromDate?, toDate? },
//   consignment?: { consignorId?, consignorBranchId?, consigneeId?, consigneeBranchId? },
//   dealerDetails?: { invoiceDealerId?, shipToDealerId? },
//   material?: { materialId?, deliveryCategory?, dynamicFields? },
//   truckDetails?: { truckId?, driverId? },
//   dcDateFrom?, dcDateTo?, isActive?,
// }
// -> DeliveryChallan[] — a bare array holding just the requested page.
export async function filterDeliveryChallansApi(payload, { page = 1, limit = 20 } = {}) {
  const { data } = await api.post('/delivery-challans/filter', payload, { params: { page, limit } })
  return data
}

// Uploads the odometer photo (POST /images/upload-multiple) and resolves
// with { url } — the saved file's URL.
export async function uploadOdometerImageApi(file) {
  return { url: await uploadImageApi(file) }
}

// GET {{apiBaseUrl}}/delivery-challans/pdf/:dcId -> PDF file (blob)
export async function downloadDeliveryChallanPdfApi(dcId) {
  const { data } = await api.get(`/delivery-challans/pdf/${dcId}`, { responseType: 'blob' })
  return data
}

// POST {{apiBaseUrl}}/delivery-challans/filter/excel — same payload shape as
// POST /delivery-challans/filter (unpaginated: every matching row).
// -> Excel file (blob)
export async function exportDeliveryChallansExcelApi(payload) {
  const { data } = await api.post('/delivery-challans/filter/excel', payload, { responseType: 'blob' })
  return data
}
