import { api } from '@/services/api'
import type { IAuthRepository } from '@/repositories/interfaces/IAuthRepository'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '@/types/auth.types'
import type { UserResponse } from '@/types/user.types'

export class HttpAuthRepository implements IAuthRepository {
  async login(request: LoginRequest) {
    const { data } = await api.post<ApiSuccessResponse<LoginResponse>>(
      '/api/auth/login',
      request,
    )
    return data
  }

  async register(request: RegisterRequest) {
    const { data } = await api.post<ApiSuccessResponse<LoginResponse>>(
      '/api/auth/register',
      request,
    )
    return data
  }

  async logout(refreshToken?: string | null): Promise<void> {
    await api.post('/api/auth/logout', { refreshToken: refreshToken ?? undefined })
  }

  async getCurrentUser() {
    const { data } = await api.get<ApiSuccessResponse<UserResponse>>('/api/users/me')
    return data
  }

  async refresh(refreshToken: string) {
    const { data } = await api.post<ApiSuccessResponse<{ token: string; refreshToken: string }>>(
      '/api/auth/refresh',
      { refreshToken },
    )
    return data
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await api.post('/api/auth/forgot-password', request)
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await api.post('/api/auth/reset-password', request)
  }
}
