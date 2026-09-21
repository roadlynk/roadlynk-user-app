// TODO: remove once the real GET /delivery-challans backend is reachable —
// lets the demo keep working end-to-end without a running API.

export const DUMMY_DELIVERY_CHALLANS_RESPONSE = [
  {
    _id: '6aaaa2afbcc42942e30c6325',
    companyId: '6aa3b2553498aa0d37e43579',
    sequence: 5,
    dcNumber: 'MST-DC-00005',
    companyDetails: {
      invoice: 'INV-001',
      shipmentNumber: 'SHIP-001',
      date: '2026-09-16T00:00:00.000Z',
    },
    consignment: {
      consignorId: '6aa8fb52031594ba0699398f',
      consignorBranchId: '6aa8fc03031594ba06993996',
      consigneeId: '6aa8fb5e031594ba06993990',
      consigneeBranchId: '6aa8fbb3031594ba06993991',
      bunkName: 'Main Bunk',
      account: 'ACC-001',
    },
    truckDetails: {
      truckId: '6aa6e3987ee8460ba8ba79d5',
      driverId: '6aa81c84ee60b052dd525b6f',
    },
    dealerDetails: {
      invoiceDealerId: '6aaa74a1a54b760a75c16914',
      shipToDealerId: '6aaa74a1a54b760a75c16914',
      isSame: true,
    },
    material: {
      materialId: '6aaa70ebef1575e87f2ddfb7',
      deliveryCategory: 'Bulk',
      loadingQuantity: 20,
      dynamicFields: { 'Bag Count': 400, Grade: 'DSP' },
    },
    rate: {
      transportRate: 1200,
      transportIncentive: 100,
      biddingAmount: 0,
      totalTransportRate: 1300,
    },
    distance: {
      odomenterImageUrl: 'https://example.com/odometer.jpg',
      odometerDistance: 145,
      calculatedDistance: 140,
      companyDistance: 142,
    },
    advance: {
      cashAdvance: 1000,
      dieselAdvance: 2000,
      bankAdvance: 10000,
      isPaymentDone: true,
      totalAdvance: 13000,
    },
    additionalInformation: { notes: 'Handle with care' },
    isActive: true,
    dcDate: '2026-09-16T14:07:43.303Z',
    createdAt: '2026-09-16T14:07:43.305Z',
    updatedAt: '2026-09-16T14:07:43.305Z',
    __v: 0,
  },
  {
    _id: '6aaaa2afbcc42942e30c6320',
    companyId: '6aa3b2553498aa0d37e43579',
    sequence: 4,
    dcNumber: 'MST-DC-00004',
    companyDetails: {
      invoice: 'INV-000',
      shipmentNumber: 'SHIP-000',
      date: '2026-09-10T00:00:00.000Z',
    },
    consignment: {
      consignorId: '6aa8fb52031594ba0699398f',
      consignorBranchId: '6aa8fbfa031594ba06993994',
      consigneeId: '6aa8fb5e031594ba06993990',
      consigneeBranchId: '6aa8fbb9031594ba06993992',
      bunkName: 'Main Bunk',
      account: 'ACC-002',
    },
    truckDetails: {
      truckId: '6aa6e6257ee8460ba8ba79db',
      driverId: '6aa81c6cee60b052dd525b6d',
    },
    dealerDetails: {
      invoiceDealerId: '6aaa74cea54b760a75c16915',
      shipToDealerId: '6aaa74cea54b760a75c16915',
      isSame: true,
    },
    material: {
      materialId: '6aa9749ec044cc76a5ff6610',
      deliveryCategory: 'Pond Ash',
      loadingQuantity: 15,
      dynamicFields: { 'Moisture %': 8 },
    },
    rate: {
      transportRate: 900,
      transportIncentive: 50,
      biddingAmount: 20,
      totalTransportRate: 930,
    },
    distance: {
      odomenterImageUrl: '',
      odometerDistance: 98,
      calculatedDistance: 98.2,
      companyDistance: 102,
    },
    advance: {
      cashAdvance: 500,
      dieselAdvance: 1000,
      bankAdvance: 0,
      isPaymentDone: false,
      totalAdvance: 1500,
    },
    additionalInformation: { notes: '' },
    isActive: true,
    dcDate: '2026-09-10T09:12:00.000Z',
    createdAt: '2026-09-10T09:12:00.000Z',
    updatedAt: '2026-09-10T09:12:00.000Z',
    __v: 0,
  },
  {
    _id: '6aaaa2afbcc42942e30c6330',
    companyId: '6aa3b2553498aa0d37e43579',
    sequence: 6,
    dcNumber: 'MST-DC-00006',
    companyDetails: {
      invoice: 'INV-002',
      shipmentNumber: 'SHIP-002',
      date: '2026-09-14T00:00:00.000Z',
    },
    consignment: {
      consignorId: '6aa8fb52031594ba0699398f',
      consignorBranchId: '6aa8fbff031594ba06993995',
      consigneeId: '6aa8fb5e031594ba06993990',
      consigneeBranchId: '6aa8fbd1031594ba06993993',
      bunkName: 'Main Bunk',
      account: 'ACC-003',
    },
    truckDetails: {
      truckId: '6aa6e7a21407006c6c3378c5',
      driverId: '6aa81c6cee60b052dd525b6d',
    },
    dealerDetails: {
      invoiceDealerId: '6aaa74cea54b760a75c16915',
      shipToDealerId: '6aaa74cea54b760a75c16915',
      isSame: true,
    },
    material: {
      materialId: '6aaa70ebef1575e87f2ddfb7',
      deliveryCategory: 'Trade',
      loadingQuantity: 18,
      dynamicFields: { 'Bag Count': 360, Grade: 'OPC' },
    },
    rate: {
      transportRate: 1100,
      transportIncentive: 80,
      biddingAmount: 30,
      totalTransportRate: 1150,
    },
    distance: {
      odomenterImageUrl: '',
      odometerDistance: 110,
      calculatedDistance: 110,
      companyDistance: 115,
    },
    advance: {
      cashAdvance: 800,
      dieselAdvance: 1500,
      bankAdvance: 5000,
      isPaymentDone: true,
      totalAdvance: 7300,
    },
    additionalInformation: { notes: 'Deliver before noon' },
    isActive: true,
    dcDate: '2026-09-14T11:20:00.000Z',
    createdAt: '2026-09-14T11:20:00.000Z',
    updatedAt: '2026-09-14T11:20:00.000Z',
    __v: 0,
  },
  {
    _id: '6aaaa2afbcc42942e30c6335',
    companyId: '6aa3b2553498aa0d37e43579',
    sequence: 7,
    dcNumber: 'MST-DC-00007',
    companyDetails: {
      invoice: 'INV-003',
      shipmentNumber: 'SHIP-003',
      date: '2026-09-15T00:00:00.000Z',
    },
    consignment: {
      consignorId: '6aa8fb52031594ba0699398f',
      consignorBranchId: '6aa8fbfa031594ba06993994',
      consigneeId: '6aa8fb5e031594ba06993990',
      consigneeBranchId: '6aa8fbb3031594ba06993991',
      bunkName: 'Main Bunk',
      account: 'ACC-004',
    },
    truckDetails: {
      truckId: '6aa6e3c17ee8460ba8ba79d9',
      driverId: '6aa81c84ee60b052dd525b6f',
    },
    dealerDetails: {
      invoiceDealerId: '6aaa74a1a54b760a75c16914',
      shipToDealerId: '6aaa74a1a54b760a75c16914',
      isSame: true,
    },
    material: {
      materialId: '6aa9749ec044cc76a5ff6610',
      deliveryCategory: 'Dry Fly Ash',
      loadingQuantity: 22,
      dynamicFields: { 'Moisture %': 6 },
    },
    rate: {
      transportRate: 950,
      transportIncentive: 60,
      biddingAmount: 0,
      totalTransportRate: 1010,
    },
    distance: {
      odomenterImageUrl: '',
      odometerDistance: 98,
      calculatedDistance: 98.2,
      companyDistance: 102,
    },
    advance: {
      cashAdvance: 600,
      dieselAdvance: 1200,
      bankAdvance: 0,
      isPaymentDone: false,
      totalAdvance: 1800,
    },
    additionalInformation: { notes: '' },
    isActive: true,
    dcDate: '2026-09-15T08:45:00.000Z',
    createdAt: '2026-09-15T08:45:00.000Z',
    updatedAt: '2026-09-15T08:45:00.000Z',
    __v: 0,
  },
]

export function listDummyDeliveryChallans({ companyId, page = 1, limit = 20, active } = {}) {
  const matches = DUMMY_DELIVERY_CHALLANS_RESPONSE.filter((dc) => {
    if (dc.companyId !== companyId) return false
    if (active !== undefined && dc.isActive !== active) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(matches.length / limit))
  const start = (page - 1) * limit

  return {
    data: matches.slice(start, start + limit),
    total: matches.length,
    currentPage: page,
    totalPages,
  }
}

// Mirrors POST /delivery-challans/filter — same payload shape (see
// delivery-challan-service.js) against the same fixtures.
export function filterDummyDeliveryChallans(payload, { page = 1, limit = 20 } = {}) {
  const matches = DUMMY_DELIVERY_CHALLANS_RESPONSE.filter((dc) => {
    if (dc.companyId !== payload.companyId) return false
    if (payload.isActive !== undefined && dc.isActive !== payload.isActive) return false

    const companyDetails = payload.companyDetails
    if (companyDetails) {
      if (companyDetails.invoice && !dc.companyDetails?.invoice?.toLowerCase().includes(companyDetails.invoice.toLowerCase())) return false
      if (
        companyDetails.shipmentNumber &&
        !dc.companyDetails?.shipmentNumber?.toLowerCase().includes(companyDetails.shipmentNumber.toLowerCase())
      )
        return false
      const companyDate = dc.companyDetails?.date?.slice(0, 10)
      if (companyDetails.fromDate && (!companyDate || companyDate < companyDetails.fromDate)) return false
      if (companyDetails.toDate && (!companyDate || companyDate > companyDetails.toDate)) return false
    }

    const consignment = payload.consignment
    if (consignment) {
      if (consignment.consignorId && dc.consignment?.consignorId !== consignment.consignorId) return false
      if (consignment.consignorBranchId && dc.consignment?.consignorBranchId !== consignment.consignorBranchId) return false
      if (consignment.consigneeId && dc.consignment?.consigneeId !== consignment.consigneeId) return false
      if (consignment.consigneeBranchId && dc.consignment?.consigneeBranchId !== consignment.consigneeBranchId) return false
    }

    const dealerDetails = payload.dealerDetails
    if (dealerDetails) {
      if (dealerDetails.invoiceDealerId && dc.dealerDetails?.invoiceDealerId !== dealerDetails.invoiceDealerId) return false
      if (dealerDetails.shipToDealerId && dc.dealerDetails?.shipToDealerId !== dealerDetails.shipToDealerId) return false
    }

    const material = payload.material
    if (material) {
      if (material.materialId && dc.material?.materialId !== material.materialId) return false
      if (material.deliveryCategory && dc.material?.deliveryCategory !== material.deliveryCategory) return false
      if (material.dynamicFields) {
        for (const [fieldName, value] of Object.entries(material.dynamicFields)) {
          if (String(dc.material?.dynamicFields?.[fieldName] ?? '') !== String(value)) return false
        }
      }
    }

    const truckDetails = payload.truckDetails
    if (truckDetails) {
      if (truckDetails.truckId && dc.truckDetails?.truckId !== truckDetails.truckId) return false
      if (truckDetails.driverId && dc.truckDetails?.driverId !== truckDetails.driverId) return false
    }

    const dcDate = dc.dcDate?.slice(0, 10)
    if (payload.dcDateFrom && (!dcDate || dcDate < payload.dcDateFrom)) return false
    if (payload.dcDateTo && (!dcDate || dcDate > payload.dcDateTo)) return false

    return true
  })

  const totalPages = Math.max(1, Math.ceil(matches.length / limit))
  const start = (page - 1) * limit

  return {
    data: matches.slice(start, start + limit),
    total: matches.length,
    currentPage: page,
    totalPages,
  }
}
