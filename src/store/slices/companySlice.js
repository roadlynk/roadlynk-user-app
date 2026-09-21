import { createSlice } from '@reduxjs/toolkit'

// The company the user opened from a company list. There's no
// GET /companies/:id endpoint, so it's kept here (persisted by redux-persist)
// and survives a page refresh inside the company workspace.
const initialState = {
  selectedCompany: null,
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
  },
})

export const { setSelectedCompany, clearSelectedCompany } = companySlice.actions
export default companySlice.reducer
