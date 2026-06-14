import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { tokenService } from '../auth/tokenService'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle errors and refresh token flow
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config

    // Check for 401 Unauthorized errors to attempt automatic token renewal
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers._retry) {
      originalRequest.headers._retry = 'true'
      try {
        const refreshToken = tokenService.getRefreshToken()
        if (refreshToken) {
          // Invoke refresh token renewal API directly using global axios to avoid interceptor loop
          const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
          const { token: newToken } = response.data
          tokenService.setToken(newToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return api(originalRequest)
        }
      } catch (refreshError) {
        tokenService.clearTokens()
        // Dispatch window redirect to login on failure
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
