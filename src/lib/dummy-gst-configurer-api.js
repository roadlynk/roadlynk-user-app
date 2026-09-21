import { createDummyStore } from './dummy-store'

// TODO: remove once the real GET/POST/PATCH /gst-configurer backend is
// reachable — lets the demo keep working end-to-end without a running API.

export const DUMMY_GST_CONFIGS_RESPONSE = [
  {
    _id: '6aa8eb29e7ffe8067eaaeb17',
    code: 'GST18',
    percentage: 18,
    effectiveFrom: '2026-09-16T23:59:59.999Z',
    isActive: true,
    createdAt: '2026-09-15T06:52:25.080Z',
    updatedAt: '2026-09-15T06:52:37.572Z',
    __v: 0,
  },
  {
    _id: '6aa8e92de7ffe8067eaaeb16',
    code: 'GST17',
    percentage: 17,
    effectiveFrom: '2025-09-15T00:00:00.000Z',
    effectiveTo: '2026-09-15T23:59:59.999Z',
    isActive: false,
    createdAt: '2026-09-15T06:43:57.681Z',
    updatedAt: '2026-09-15T06:52:37.571Z',
    __v: 0,
  },
]

const gstConfigsStore = createDummyStore(DUMMY_GST_CONFIGS_RESPONSE)

export function listDummyGstConfigs() {
  return gstConfigsStore.list()
}

export function createDummyGstConfig(payload) {
  return gstConfigsStore.add({
    ...payload,
    _id: `gst-config-${crypto.randomUUID()}`,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  })
}

export function updateDummyGstConfig(id, payload) {
  return gstConfigsStore.update(id, { ...payload, updatedAt: new Date().toISOString() })
}

export function activateDummyGstConfig(id) {
  for (const item of gstConfigsStore.list()) {
    gstConfigsStore.update(item._id, { isActive: item._id === id, updatedAt: new Date().toISOString() })
  }
  return gstConfigsStore.list().find((item) => item._id === id) ?? null
}
