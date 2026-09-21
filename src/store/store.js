import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist'
import authReducer from './slices/authSlice'
import companyReducer from './slices/companySlice'
import uiPreferencesReducer from './slices/uiPreferencesSlice'

// redux-persist's own `redux-persist/lib/storage` is a CJS module whose default
// export doesn't always unwrap correctly through Vite's dev-server pre-bundling
// (surfaces as "storage.getItem is not a function"). It's just a thin Promise
// wrapper around localStorage, so we provide that wrapper ourselves instead.
const storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
}

const rootReducer = combineReducers({
  auth: authReducer,
  company: companyReducer,
  uiPreferences: uiPreferencesReducer,
})

const persistedReducer = persistReducer({ key: 'roadlynk', storage }, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
