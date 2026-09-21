import { api } from './api-client'

// GET {{apiBaseUrl}}/gst-configurer -> GstConfig[]
export async function listGstConfigsApi() {
  const { data } = await api.get('/gst-configurer')
  return data
}

// POST {{apiBaseUrl}}/gst-configurer
// { code, percentage, effectiveFrom, effectiveTo }
// effectiveTo is optional.
export async function createGstConfigApi(payload) {
  const { data } = await api.post('/gst-configurer', payload)
  return data
}

// PATCH {{apiBaseUrl}}/gst-configurer/:id — same payload shape as create.
export async function updateGstConfigApi(id, payload) {
  const { data } = await api.patch(`/gst-configurer/${id}`, payload)
  return data
}

// PATCH {{apiBaseUrl}}/gst-configurer/active-status/:id — activates this GST
// configuration; the backend deactivates every other one in the same call.
export async function activateGstConfigApi(id) {
  const { data } = await api.patch(`/gst-configurer/active-status/${id}`)
  return data
}
