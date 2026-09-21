// TODO: remove once the real POST /transport-rates/filter and
// POST /transport-rates backends are reachable — lets the demo keep working
// end-to-end without a running API.

export const DUMMY_TRANSPORT_RATES_RESPONSE = [
  // Consignor: MS Transport / Mettur Main Branch, Consignee: Dalmia,
  // Dealer: ABC Dealers, Material: Cement — full history with 2 superseded
  // configurations plus the currently active one.
  {
    _id: '6aaa88bdee1a37c9c5538330',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb52031594ba0699398f',
    consignorBranchId: '6aa8fc03031594ba06993996',
    consigneeId: '6aa8fb5e031594ba06993990',
    dealerId: '6aaa74a1a54b760a75c16914',
    materialId: '6aaa70ebef1575e87f2ddfb7',
    tonnageRate: [{ fromLimit: 0, toLimit: 10, transportRate: [80, 80, 120], _id: '6aaa88bdee1a37c9c5538331' }],
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveTo: '2026-05-01T00:00:00.000Z',
    calculatedDistance: 145.5,
    companyDistance: 150,
    isActive: false,
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-05-01T09:00:00.000Z',
    __v: 0,
  },
  {
    _id: '6aaa88bdee1a37c9c5538335',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb52031594ba0699398f',
    consignorBranchId: '6aa8fc03031594ba06993996',
    consigneeId: '6aa8fb5e031594ba06993990',
    dealerId: '6aaa74a1a54b760a75c16914',
    materialId: '6aaa70ebef1575e87f2ddfb7',
    tonnageRate: [
      { fromLimit: 1, toLimit: 10, transportRate: [90, 90, 135], _id: '6aaa88bdee1a37c9c5538336' },
      { fromLimit: 0, toLimit: 10, transportRate: [85, 85, 110], _id: '6aaa88bdee1a37c9c5538337' },
    ],
    effectiveFrom: '2026-05-01T00:00:00.000Z',
    effectiveTo: '2026-09-16T00:00:00.000Z',
    calculatedDistance: 145.5,
    companyDistance: 150,
    isActive: false,
    createdAt: '2026-05-01T09:00:00.000Z',
    updatedAt: '2026-09-16T09:00:00.000Z',
    __v: 0,
  },
  {
    _id: '6aaa88bdee1a37c9c5538344',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb52031594ba0699398f',
    consignorBranchId: '6aa8fc03031594ba06993996',
    consigneeId: '6aa8fb5e031594ba06993990',
    dealerId: '6aaa74a1a54b760a75c16914',
    materialId: '6aaa70ebef1575e87f2ddfb7',
    tonnageRate: [
      { fromLimit: 1, toLimit: 10, transportRate: [100, 100, 150], _id: '6aaa88bdee1a37c9c5538345' },
      { fromLimit: 0, toLimit: 10, transportRate: [95, 95, 100], _id: '6aaa88bdee1a37c9c5538346' },
    ],
    effectiveFrom: '2026-09-16T00:00:00.000Z',
    effectiveTo: null,
    calculatedDistance: 145.5,
    companyDistance: 150,
    isActive: true,
    createdAt: '2026-09-16T12:17:01.017Z',
    updatedAt: '2026-09-16T12:17:01.017Z',
    __v: 0,
  },
  // Consignor: MS Transport / Ariyalur, Consignee: Dalmia, Dealer: XYZ
  // Dealers, Material: Ash — a second combination with only one (active)
  // configuration, to show the empty-history case is per-combination.
  {
    _id: '6aaa88bdee1a37c9c553834f',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb52031594ba0699398f',
    consignorBranchId: '6aa8fbfa031594ba06993994',
    consigneeId: '6aa8fb5e031594ba06993990',
    dealerId: '6aaa74cea54b760a75c16915',
    materialId: '6aa9749ec044cc76a5ff6610',
    tonnageRate: [{ fromLimit: 0, toLimit: 15, transportRate: [70, 70, 100], _id: '6aaa88bdee1a37c9c5538350' }],
    effectiveFrom: '2026-08-01T00:00:00.000Z',
    effectiveTo: null,
    calculatedDistance: 98.2,
    companyDistance: 102,
    isActive: true,
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
    __v: 0,
  },
  // Consignor: MS Transport / Sattur, Consignee: Dalmia, Dealer: ABC
  // Dealers, Material: Ash — another single-configuration combination.
  {
    _id: '6aaa88bdee1a37c9c5538360',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb52031594ba0699398f',
    consignorBranchId: '6aa8fbff031594ba06993995',
    consigneeId: '6aa8fb5e031594ba06993990',
    dealerId: '6aaa74a1a54b760a75c16914',
    materialId: '6aa9749ec044cc76a5ff6610',
    tonnageRate: [{ fromLimit: 0, toLimit: 12, transportRate: [75, 75, 105], _id: '6aaa88bdee1a37c9c5538361' }],
    effectiveFrom: '2026-07-01T00:00:00.000Z',
    effectiveTo: null,
    calculatedDistance: 110,
    companyDistance: 115,
    isActive: true,
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    __v: 0,
  },
  // Consignor: MS Transport / Mettur Main Branch, Consignee: Dalmia,
  // Dealer: XYZ Dealers, Material: Cement — same lane as the first
  // combination above but a different dealer, with a shorter (1-entry)
  // history.
  {
    _id: '6aaa88bdee1a37c9c5538365',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb52031594ba0699398f',
    consignorBranchId: '6aa8fc03031594ba06993996',
    consigneeId: '6aa8fb5e031594ba06993990',
    dealerId: '6aaa74cea54b760a75c16915',
    materialId: '6aaa70ebef1575e87f2ddfb7',
    tonnageRate: [{ fromLimit: 0, toLimit: 10, transportRate: [88, 88, 128], _id: '6aaa88bdee1a37c9c5538366' }],
    effectiveFrom: '2026-03-01T00:00:00.000Z',
    effectiveTo: '2026-09-01T00:00:00.000Z',
    calculatedDistance: 145.5,
    companyDistance: 150,
    isActive: false,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-09-01T09:00:00.000Z',
    __v: 0,
  },
  {
    _id: '6aaa88bdee1a37c9c553836a',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb52031594ba0699398f',
    consignorBranchId: '6aa8fc03031594ba06993996',
    consigneeId: '6aa8fb5e031594ba06993990',
    dealerId: '6aaa74cea54b760a75c16915',
    materialId: '6aaa70ebef1575e87f2ddfb7',
    tonnageRate: [{ fromLimit: 0, toLimit: 10, transportRate: [98, 98, 138], _id: '6aaa88bdee1a37c9c553836b' }],
    effectiveFrom: '2026-09-01T00:00:00.000Z',
    effectiveTo: null,
    calculatedDistance: 145.5,
    companyDistance: 150,
    isActive: true,
    createdAt: '2026-09-01T09:00:00.000Z',
    updatedAt: '2026-09-01T09:00:00.000Z',
    __v: 0,
  },
  // Consignor: MS Transport / Ariyalur, Consignee: Dalmia, Dealer: ABC
  // Dealers, Material: Cement — same lane as the Ash/XYZ combination above
  // but a different dealer/material pairing.
  {
    _id: '6aaa88bdee1a37c9c5538370',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb52031594ba0699398f',
    consignorBranchId: '6aa8fbfa031594ba06993994',
    consigneeId: '6aa8fb5e031594ba06993990',
    dealerId: '6aaa74a1a54b760a75c16914',
    materialId: '6aaa70ebef1575e87f2ddfb7',
    tonnageRate: [{ fromLimit: 0, toLimit: 10, transportRate: [72, 72, 108], _id: '6aaa88bdee1a37c9c5538371' }],
    effectiveFrom: '2026-08-15T00:00:00.000Z',
    effectiveTo: null,
    calculatedDistance: 98.2,
    companyDistance: 102,
    isActive: true,
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
    __v: 0,
  },
]

// Rough stand-in for POST /transport-rates/get-transport-rate-and-location:
// finds the active configuration for the combination and picks the tonnage
// tier that the load falls into, defaulting to the first rate in that tier.
export function lookupDummyTransportRateAndLocation({ consignorId, consignorBranchId, consigneeId, dealerId, materialId, loadCapacity }) {
  const rate = DUMMY_TRANSPORT_RATES_RESPONSE.find(
    (item) =>
      item.isActive &&
      item.consignorId === consignorId &&
      item.consignorBranchId === consignorBranchId &&
      item.consigneeId === consigneeId &&
      item.dealerId === dealerId &&
      item.materialId === materialId,
  )
  if (!rate) return null

  const tier = rate.tonnageRate.find((item) => loadCapacity >= item.fromLimit && loadCapacity <= item.toLimit) ?? rate.tonnageRate[0]

  return {
    finalTransportRate: tier.transportRate[0],
    calculatedDistance: rate.calculatedDistance,
    companyDistance: rate.companyDistance,
  }
}
