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
}

export interface LoginResponse {
  token: string
  user: UserResponse
}
