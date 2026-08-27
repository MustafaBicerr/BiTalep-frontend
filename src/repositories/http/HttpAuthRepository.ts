import { api } from '@/services/api'
import type { IAuthRepository } from '@/repositories/interfaces/IAuthRepository'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth.types'
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

  async logout(): Promise<void> {
    // Client-side only for v1
  }

  async getCurrentUser() {
    const { data } = await api.get<ApiSuccessResponse<UserResponse>>('/api/users/me')
    return data
  }
}
