import axios, { InternalAxiosRequestConfig } from 'axios'
import logger from '../utils/logger'
import { handleApiError } from '../utils/errors'

// ✅ Refresh lock - prevents parallel refresh calls
let isRefreshing = false
let refreshQueue: Array<() => void> = []

export const api = axios.create({
  baseURL: '/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    logger.api(`→ ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error: unknown) => {
    const appError = handleApiError(error)
    logger.error('Request setup failed', appError)
    return Promise.reject(error)
  }
)

// ✅ Response interceptor
api.interceptors.response.use(
  (response) => {
    logger.api(`← ${response.status} ${response.config.url}`)
    return response
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      logger.error('Non-axios error in interceptor', error)
      return Promise.reject(error)
    }

    const originalRequest = error.config as InternalAxiosRequestConfig
    const status = error.response?.status

    logger.api(`← ${status} ${originalRequest?.url}`)

    // ✅ Handle 401 - try refresh with lock
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(api(originalRequest)))
        })
      }

      isRefreshing = true

      try {
        logger.auth('Access token expired - attempting refresh')
        await api.post('/v1/auth/refresh')
        logger.success('Token refreshed - retrying request')

        // Release all queued requests
        refreshQueue.forEach(cb => cb())
        refreshQueue = []

        return api(originalRequest)
      } catch (refreshError) {
        refreshQueue = []
        logger.error('Token refresh failed - redirecting to login')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // ✅ Handle 403
    if (status === 403) {
      logger.warn('Access forbidden', { url: originalRequest?.url })
      window.location.href = '/unauthorized'
    }

    // ✅ Handle network errors
    if (!error.response) {
      logger.error('Network error - backend unreachable')
    }

    return Promise.reject(error)
  }
)

export * from './auth'
export * from './admin'