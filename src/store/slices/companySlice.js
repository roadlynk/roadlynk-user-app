import { createSlice } from '@reduxjs/toolkit'

// The company the user opened from a company list. There's no
// GET /companies/:id endpoint, so it's kept here (persisted by redux-persist)
// and survives a page refresh inside the company workspace.
const initialState = {
  selectedCompany: null,
  // Whether the logged-in user has exactly one company overall — set from
  // the company list's last load, so the workspace's "back" button can skip
  // returning to a list that would just auto-redirect right back here.
  isOnlyCompany: false,
}

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setSelectedCompany(state, action) {
      state.selectedCompany = action.payload ?? null
    },
    clearSelectedCompany(state) {
      state.selectedCompany = null
    },
    setIsOnlyCompany(state, action) {
      state.isOnlyCompany = Boolean(action.payload)
    },
  },
})

export const { setSelectedCompany, clearSelectedCompany, setIsOnlyCompany } = companySlice.actions
export default companySlice.reducer
