// lib/utils/errors.ts
import axios from 'axios'
import logger from './logger'

export interface AppError {
  message: string
  status?: number
  code?: string
}

export function handleApiError(error: unknown): AppError {
  // ✅ Handle Axios errors (from API calls)
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const serverMessage = error.response?.data?.message

    logger.error('API Error', { status, message: serverMessage })

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return {
          message: serverMessage || 'Invalid request. Please check your input.',
          status,
          code: 'BAD_REQUEST'
        }
      case 401:
        return {
          message: serverMessage || 'Invalid email or password.',
          status,
          code: 'UNAUTHORIZED'
        }
      case 403:
        return {
          message: serverMessage || 'You do not have permission to do this.',
          status,
          code: 'FORBIDDEN'
        }
      case 404:
        return {
          message: serverMessage || 'Resource not found.',
          status,
          code: 'NOT_FOUND'
        }
      case 409:
        return {
          message: serverMessage || 'This email is already registered.',
          status,
          code: 'CONFLICT'
        }
      case 429:
        return {
          message: 'Too many requests. Please wait and try again.',
          status,
          code: 'RATE_LIMITED'
        }
      case 500:
        return {
          message: 'Server error. Please try again later.',
          status,
          code: 'SERVER_ERROR'
        }
      default:
        return {
          message: serverMessage || 'Something went wrong. Please try again.',
          status,
          code: 'UNKNOWN'
        }
    }
  }

  // ✅ Handle network errors
  if (error instanceof Error) {
    if (error.message === 'Network Error') {
      logger.error('Network Error - Backend unreachable')
      return {
        message: 'Cannot connect to server. Check your internet connection.',
        code: 'NETWORK_ERROR'
      }
    }
    return {
      message: error.message,
      code: 'CLIENT_ERROR'
    }
  }

  // ✅ Unknown errors
  logger.error('Unknown error', error)
  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN'
  }
}