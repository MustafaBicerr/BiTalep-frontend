import type { UserResponse } from './user.types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  surname: string
  email: string
  password: string
  companyName: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken?: string
  user: UserResponse
}
