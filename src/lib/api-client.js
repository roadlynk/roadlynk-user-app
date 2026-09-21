import axios from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './token-storage'
import { startLoading, stopLoading } from './loading-store'

const baseURL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  startLoading()
  const accessToken = getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh']

let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available.')
  }

  const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
  setTokens(data)
  return data.accessToken
}

api.interceptors.response.use(
  (response) => {
    stopLoading()
    return response
  },
  async (error) => {
    stopLoading()
    const { config, response } = error
    const isAuthEndpoint = config && AUTH_ENDPOINTS.some((endpoint) => config.url?.includes(endpoint))

    if (response?.status !== 401 || !config || config._retried || isAuthEndpoint) {
      return Promise.reject(error)
    }

    config._retried = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newAccessToken = await refreshPromise

      config.headers.Authorization = `Bearer ${newAccessToken}`
      return api(config)
    } catch (refreshError) {
      clearTokens()
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
      return Promise.reject(refreshError)
    }
  },
)
