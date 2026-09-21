import { createSlice } from '@reduxjs/toolkit'

// Persisted, per-page "Show inactive" toggle state — survives page refresh.
const initialState = {
  companiesShowInactive: false,
  usersShowInactive: false,
}

const uiPreferencesSlice = createSlice({
  name: 'uiPreferences',
  initialState,
  reducers: {
    setCompaniesShowInactive(state, action) {
      state.companiesShowInactive = action.payload
    },
    setUsersShowInactive(state, action) {
      state.usersShowInactive = action.payload
    },
  },
})

export const { setCompaniesShowInactive, setUsersShowInactive } = uiPreferencesSlice.actions
export default uiPreferencesSlice.reducer
