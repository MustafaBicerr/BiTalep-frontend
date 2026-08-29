import type { Department, UserRole } from './enums'

export interface UserResponse {
  id: string
  name: string
  surname: string
  email: string
  role: UserRole
  department: Department
  tenantId: string
  createdDate: string
}

export interface CreateUserRequest {
  name: string
  surname: string
  email: string
  role: UserRole
  department: Department
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
  department?: Department
}

export interface UserEntity {
  id: string
  name: string
  surname: string
  email: string
  password: string
  role: UserRole
  department: Department
  tenantId: string
  createdDate: string
}
