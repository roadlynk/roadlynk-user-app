import { createDummyStore } from './dummy-store'

// TODO: remove once the real GET/POST/PATCH /clients and /client-branches
// backends are reachable — lets the demo keep working end-to-end without a
// running API.

export const DUMMY_CLIENTS_ACTIVE_RESPONSE = [
  {
    _id: '6aa8fb5e031594ba06993990',
    name: 'Dalmia',
    clientCode: 'DLM_UPDATED',
    companyId: '6aa3b2553498aa0d37e43579',
    isActive: true,
    createdAt: '2026-09-15T08:01:34.849Z',
    updatedAt: '2026-09-15T08:10:41.023Z',
    __v: 0,
    branches: [
      {
        _id: '6aa8fbb3031594ba06993991',
        branchName: 'Mettur',
        clientId: '6aa8fb5e031594ba06993990',
        address: {
          type: 'PINCODE',
          pincodeAddress: {
            pincode: '636401',
            state: 'Tamil Nadu',
            district: 'Salem',
            town: 'Mettur',
            fullAddress: '1 Dam Road, Mettur, Tamil Nadu 636401',
          },
        },
        isActive: true,
        createdAt: '2026-09-15T08:02:59.732Z',
        updatedAt: '2026-09-15T08:02:59.732Z',
        __v: 0,
      },
      {
        _id: '6aa8fbb9031594ba06993992',
        branchName: 'Sattur',
        clientId: '6aa8fb5e031594ba06993990',
        address: {
          type: 'PINCODE',
          pincodeAddress: {
            pincode: '600001',
            state: 'Tamil Nadu',
            district: 'Satur',
            town: 'George Town',
            fullAddress: '123 Main Street, George Town, Satur',
          },
        },
        isActive: true,
        createdAt: '2026-09-15T08:03:05.063Z',
        updatedAt: '2026-09-15T08:03:05.063Z',
        __v: 0,
      },
      {
        _id: '6aa8fbd1031594ba06993993',
        branchName: 'Thoothukudi',
        clientId: '6aa8fb5e031594ba06993990',
        address: {
          type: 'COORDINATES',
          coordinatesAddress: {
            latitude: 8.7642,
            longitude: 78.1348,
            fullAddress: 'Harbour Estate, Thoothukudi, Tamil Nadu',
          },
        },
        isActive: false,
        createdAt: '2026-09-15T08:03:29.861Z',
        updatedAt: '2026-09-15T08:03:29.861Z',
        __v: 0,
      },
    ],
  },
  {
    _id: '6aa8fb52031594ba0699398f',
    name: 'MS Transport',
    clientCode: 'MST',
    companyId: '6aa3b2553498aa0d37e43579',
    isActive: true,
    createdAt: '2026-09-15T08:01:22.839Z',
    updatedAt: '2026-09-15T08:12:55.500Z',
    __v: 0,
    branches: [
      {
        _id: '6aa8fbfa031594ba06993994',
        branchName: 'Ariyalur',
        clientId: '6aa8fb52031594ba0699398f',
        address: {
          type: 'PINCODE',
          pincodeAddress: {
            pincode: '621704',
            state: 'Tamil Nadu',
            district: 'Ariyalur',
            town: 'Ariyalur',
            fullAddress: '1 Bypass Road, Ariyalur, Tamil Nadu 621704',
          },
        },
        isActive: true,
        createdAt: '2026-09-15T08:04:10.774Z',
        updatedAt: '2026-09-15T08:04:10.774Z',
        __v: 0,
      },
      {
        _id: '6aa8fc03031594ba06993996',
        branchName: 'Mettur Main Branch',
        clientId: '6aa8fb52031594ba0699398f',
        address: {
          type: 'COORDINATES',
          coordinatesAddress: {
            latitude: 11.7904,
            longitude: 77.7973,
            fullAddress: 'Main Bazaar, Mettur, Tamil Nadu',
          },
        },
        isActive: true,
        createdAt: '2026-09-15T08:04:19.791Z',
        updatedAt: '2026-09-15T08:21:18.171Z',
        __v: 0,
      },
      {
        _id: '6aa8fbff031594ba06993995',
        branchName: 'Sattur',
        clientId: '6aa8fb52031594ba0699398f',
        address: {
          type: 'PINCODE',
          pincodeAddress: {
            pincode: '600001',
            state: 'Tamil Nadu',
            district: 'Satur',
            town: 'George Town',
            fullAddress: '123 Main Street, George Town, Satur',
          },
        },
        isActive: false,
        createdAt: '2026-09-15T08:04:15.665Z',
        updatedAt: '2026-09-15T08:04:15.665Z',
        __v: 0,
      },
      // _id matches the `code` on the "Thuthukodi-Updated" dealer in
      // DUMMY_DEALER_MASTERS_ACTIVE_RESPONSE — lets the non-cement DC flow's
      // branch-to-dealer auto-match be exercised without a running API.
      {
        _id: '6aabead58cce47893bb5a1a5',
        branchName: 'Thoothukudi',
        clientId: '6aa8fb52031594ba0699398f',
        address: {
          type: 'PINCODE',
          pincodeAddress: {
            pincode: '600001',
            state: 'Tamil Nadu',
            district: 'Thuthukodi-Updated',
            town: 'George Town',
            fullAddress: '123 Main Street, George Town, Thuthukodi-Updated',
          },
        },
        isActive: true,
        createdAt: '2026-09-17T13:20:00.000Z',
        updatedAt: '2026-09-17T13:20:00.000Z',
        __v: 0,
      },
    ],
  },
]

export const DUMMY_CLIENTS_INACTIVE_RESPONSE = [
  {
    _id: '6aa8fc50031594ba06993997',
    name: 'Karunya Cements (disabled)',
    clientCode: 'KCM',
    companyId: '6aa3b2553498aa0d37e43579',
    isActive: false,
    createdAt: '2026-06-02T09:20:11.000Z',
    updatedAt: '2026-08-11T10:00:00.000Z',
    __v: 0,
    branches: [],
  },
]

const clientsStore = createDummyStore([...DUMMY_CLIENTS_ACTIVE_RESPONSE, ...DUMMY_CLIENTS_INACTIVE_RESPONSE])

export function listDummyClients({ active } = {}) {
  const items = clientsStore.list()
  return active === undefined ? items : items.filter((item) => item.isActive === active)
}

export function createDummyClient(payload) {
  return clientsStore.add({
    ...payload,
    _id: `client-${crypto.randomUUID()}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
    branches: [],
  })
}

export function updateDummyClient(clientId, payload) {
  return clientsStore.update(clientId, { ...payload, updatedAt: new Date().toISOString() })
}

export function updateDummyClientActiveStatus(clientId, isActive) {
  return clientsStore.update(clientId, { isActive, updatedAt: new Date().toISOString() })
}

export function createDummyClientBranch({ clientId, branchName, address }) {
  const client = clientsStore.list().find((item) => item._id === clientId)
  if (!client) return null

  const branch = {
    _id: `client-branch-${crypto.randomUUID()}`,
    branchName,
    clientId,
    address,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  }
  clientsStore.update(clientId, { branches: [...(client.branches ?? []), branch] })
  return branch
}

export function updateDummyClientBranch(branchId, payload) {
  let updated = null
  for (const client of clientsStore.list()) {
    const index = (client.branches ?? []).findIndex((branch) => branch._id === branchId)
    if (index === -1) continue
    const branches = [...client.branches]
    updated = { ...branches[index], ...payload, updatedAt: new Date().toISOString() }
    branches[index] = updated
    clientsStore.update(client._id, { branches })
    break
  }
  return updated
}

export function updateDummyClientBranchActiveStatus(branchId, isActive) {
  return updateDummyClientBranch(branchId, { isActive })
}
