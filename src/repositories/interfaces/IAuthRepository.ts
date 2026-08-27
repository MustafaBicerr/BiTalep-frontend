import type { ApiSuccessResponse } from '@/types/api.types'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth.types'
import type { UserResponse } from '@/types/user.types'

export interface IAuthRepository {
  login(request: LoginRequest): Promise<ApiSuccessResponse<LoginResponse>>
  register(request: RegisterRequest): Promise<ApiSuccessResponse<LoginResponse>>
  logout(): Promise<void>
  getCurrentUser(): Promise<ApiSuccessResponse<UserResponse>>
}
