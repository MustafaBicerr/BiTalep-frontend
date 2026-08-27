import type { UserRole } from './enums'

export interface UserResponse {
  id: number
  name: string
  surname: string
  email: string
  role: UserRole
  createdDate: string
}

export interface UpdateProfileRequest {
  name: string
  surname: string
}

export interface UserListParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  keyword?: string
  role?: UserRole
}

export interface UserEntity {
  id: number
  name: string
  surname: string
  email: string
  password: string
  role: UserRole
  createdDate: string
}
