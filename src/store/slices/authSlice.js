import { createSlice } from '@reduxjs/toolkit'

// Persisted auth session (access/refresh tokens + the logged-in user) —
// survives page refresh via the same redux-persist store as uiPreferences.
const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action) {
      const { accessToken, refreshToken } = action.payload ?? {}
      if (accessToken) state.accessToken = accessToken
      if (refreshToken) state.refreshToken = refreshToken
    },
    clearTokens(state) {
      state.accessToken = null
      state.refreshToken = null
    },
    setUser(state, action) {
      state.user = action.payload ?? null
    },
    clearUser(state) {
      state.user = null
    },
  },
})

export const { setTokens, clearTokens, setUser, clearUser } = authSlice.actions
export default authSlice.reducer
