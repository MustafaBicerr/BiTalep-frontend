import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ApiError, type ApiErrorResponse, type FieldError } from '@/types/api.types'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: false,
  },
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) return false
  try {
    const { data } = await axios.post<{ data: { token: string; refreshToken: string } }>(
      `${api.defaults.baseURL || ''}/api/auth/refresh`,
      { refreshToken },
      { timeout: 15_000 },
    )
    useAuthStore.getState().setTokens(data.data.token, data.data.refreshToken)
    return true
  } catch {
    return false
  }
}

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
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(normalizeError(error))
    }
    const original = error.config as RetryConfig | undefined
    const url = original?.url ?? ''
    const isAuthPath =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register') ||
      url.includes('/api/auth/refresh') ||
      url.includes('/api/auth/forgot-password') ||
      url.includes('/api/auth/reset-password')

    if (error.response?.status === 401 && original && !original._retry && !isAuthPath) {
      original._retry = true
      if (!refreshInFlight) {
        refreshInFlight = refreshAccessToken().finally(() => {
          refreshInFlight = null
        })
      }
      const ok = await refreshInFlight
      if (ok) {
        const token = useAuthStore.getState().token
        if (token) {
          original.headers.Authorization = `Bearer ${token}`
        }
        return api.request(original)
      }
      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    } else if (error.response?.status === 401 && isAuthPath && url.includes('/api/auth/refresh')) {
      useAuthStore.getState().clearAuth()
    } else if (error.response?.status === 401 && !isAuthPath) {
      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(normalizeError(error))
  },
)
