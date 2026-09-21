// Thin synchronous adapter over the Redux store — auth session state (tokens
// + user) lives in store/slices/authSlice.js and is persisted across page
// refreshes by the same redux-persist setup as everything else in the store
// (see store/store.js). Kept as its own module, with this exact function
// shape, so callers (auth-service.js, api-client.js) don't need to know
// Redux is involved, and axios interceptors can read/write it outside of
// any React component.
import { store } from '@/store/store'
import { clearTokens as clearTokensAction, clearUser as clearUserAction, setTokens as setTokensAction, setUser as setUserAction } from '@/store/slices/authSlice'

export function getAccessToken() {
  return store.getState().auth.accessToken
}

export function getRefreshToken() {
  return store.getState().auth.refreshToken
}

export function setTokens(tokens) {
  store.dispatch(setTokensAction(tokens))
}

export function clearTokens() {
  store.dispatch(clearTokensAction())
}

export function getUser() {
  return store.getState().auth.user
}

export function setUser(user) {
  store.dispatch(setUserAction(user))
}

export function clearUser() {
  store.dispatch(clearUserAction())
}
