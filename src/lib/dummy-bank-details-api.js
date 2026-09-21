import { createDummyStore } from './dummy-store'

// TODO: remove once the real GET/POST/PATCH /bank-details backend is
// reachable — lets the demo keep working end-to-end without a running API.
// Not filtered by holderId/holderType/companyId (same convention as the
// other dummy list fixtures in this app) — just a fixed sample set.

export const DUMMY_BANK_DETAILS_RESPONSE = [
  {
    _id: '6aa82095f675b4d303b9f6ba',
    bankName: 'Canara Bank',
    accountNumber: '123456789010',
    ifscCode: 'CNR0001234',
    branchName: 'Chennai Main Branch',
    accountType: 'SAVINGS',
    holderType: 'OWNER',
    holderId: '6aa6b79e5f713ee48200b66a',
    isActive: false,
    createdAt: '2026-09-14T16:28:05.654Z',
    updatedAt: '2026-09-14T16:32:18.353Z',
    __v: 0,
  },
  {
    _id: '6aa820bcf675b4d303b9f6bb',
    bankName: 'Indian Bank',
    accountNumber: '123456789011',
    ifscCode: 'IND0001234',
    branchName: 'Chennai Main Branch',
    accountType: 'SAVINGS',
    holderType: 'OWNER',
    holderId: '6aa6b79e5f713ee48200b66a',
    isActive: true,
    createdAt: '2026-09-14T16:28:44.679Z',
    updatedAt: '2026-09-14T16:32:18.355Z',
    __v: 0,
  },
  {
    _id: '6aa820dcf675b4d303b9f6bc',
    bankName: 'KVB Bank',
    accountNumber: '123456789012',
    ifscCode: 'KVB0001234',
    branchName: 'Chennai Main Branch',
    accountType: 'SAVINGS',
    holderType: 'OWNER',
    holderId: '6aa6b79e5f713ee48200b66a',
    isActive: false,
    createdAt: '2026-09-14T16:29:16.767Z',
    updatedAt: '2026-09-14T16:32:18.353Z',
    __v: 0,
  },
]

const bankDetailsStore = createDummyStore(DUMMY_BANK_DETAILS_RESPONSE)

export function listDummyBankDetails() {
  return bankDetailsStore.list()
}

export function createDummyBankDetail(payload) {
  return bankDetailsStore.add({
    ...payload,
    _id: `bank-detail-${crypto.randomUUID()}`,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  })
}

// Mirrors the real backend: activating one bank account deactivates every
// other account belonging to the same holder.
export function activateDummyBankDetail(bankDetailsId) {
  const target = bankDetailsStore.list().find((item) => item._id === bankDetailsId)
  if (!target) return null

  for (const item of bankDetailsStore.list()) {
    if (item.holderId !== target.holderId) continue
    bankDetailsStore.update(item._id, { isActive: item._id === bankDetailsId, updatedAt: new Date().toISOString() })
  }
  return bankDetailsStore.list().find((item) => item._id === bankDetailsId) ?? null
}
