// A tiny mutable in-memory store wrapping a seed array. Used by the
// dummy-*-api.js fixtures so create/update actions still work end-to-end
// when the real backend is unreachable and a page has fallen back to demo
// data — mirrors the old *-store.js pattern used before each resource had a
// real API, but scoped to the fallback path only.
export function createDummyStore(seed) {
  let items = seed.map((item) => ({ ...item }))

  return {
    list() {
      return items
    },
    add(item) {
      items = [...items, item]
      return item
    },
    update(id, patch) {
      let updated = null
      items = items.map((item) => {
        if (item._id !== id) return item
        updated = { ...item, ...patch }
        return updated
      })
      return updated
    },
  }
}
