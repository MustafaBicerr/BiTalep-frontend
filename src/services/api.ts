import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ApiError, type ApiErrorResponse, type FieldError } from '@/types/api.types'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<ApiErrorResponse>
    if (ax.code === 'ECONNABORTED' || ax.message === 'Network Error') {
      return new ApiError(0, 'NETWORK_ERROR', 'errors:network')
    }

    const status = ax.response?.status ?? 500
    const body = ax.response?.data
    const code = body?.error?.code ?? (status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR')
    const message = body?.error?.message ?? 'errors:internal'
    const fieldErrors: FieldError[] | undefined = body?.error?.details
    return new ApiError(status, code, message, fieldErrors)
  }

  return new ApiError(500, 'INTERNAL_ERROR', 'errors:internal')
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    const apiError = normalizeError(error)
    if (apiError.status === 401) {
      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(apiError)
  },
)
