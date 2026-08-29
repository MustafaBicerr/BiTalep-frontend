import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '@/types/auth.types'
import type { UserResponse } from '@/types/user.types'

export interface IAuthRepository {
  login(request: LoginRequest): Promise<ApiSuccessResponse<LoginResponse>>
  register(request: RegisterRequest): Promise<ApiSuccessResponse<LoginResponse>>
  logout(refreshToken?: string | null): Promise<void>
  getCurrentUser(): Promise<ApiSuccessResponse<UserResponse>>
  refresh(refreshToken: string): Promise<ApiSuccessResponse<{ token: string; refreshToken: string }>>
  forgotPassword(request: ForgotPasswordRequest): Promise<void>
  resetPassword(request: ResetPasswordRequest): Promise<void>
}
