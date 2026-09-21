// TODO: remove once the real POST /bunks/filter and POST /bunks backends are
// reachable — lets the demo keep working end-to-end without a running API.
// Keyed by the consignor + consignor-branch combination only — bunks are no
// longer scoped by consignee.

export const DUMMY_BUNKS_RESPONSE = [
  {
    _id: '6aa908fd73e29b5e1660cc91',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb52031594ba0699398f',
    consignorBranchId: '6aa8fc03031594ba06993996',
    bunkName: ['Indian Oil', 'Bharat Petroleum'],
    createdAt: '2026-09-15T08:59:41.377Z',
    updatedAt: '2026-09-15T08:59:41.377Z',
    __v: 0,
  },
  {
    _id: '6aa9090a73e29b5e1660cc92',
    companyId: '6aa3b2553498aa0d37e43579',
    consignorId: '6aa8fb5e031594ba06993990',
    consignorBranchId: '6aa8fbb3031594ba06993991',
    bunkName: ['Hindustan Petroleum'],
    createdAt: '2026-09-15T09:05:12.000Z',
    updatedAt: '2026-09-15T09:05:12.000Z',
    __v: 0,
  },
]

export function findDummyBunk({ consignorId, consignorBranchId }) {
  return DUMMY_BUNKS_RESPONSE.find((item) => item.consignorId === consignorId && item.consignorBranchId === consignorBranchId) ?? null
}
