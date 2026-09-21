// Tracks how many API calls are currently in flight, app-wide. The axios
// instance (api-client.js) increments/decrements this on every request, so
// any component can subscribe and show a loader without wiring per-call
// state — see components/shared/GlobalLoader.jsx.

let count = 0
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

export function startLoading() {
  count += 1
  emit()
}

export function stopLoading() {
  count = Math.max(0, count - 1)
  emit()
}

export function getLoadingSnapshot() {
  return count > 0
}

export function subscribeLoading(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
