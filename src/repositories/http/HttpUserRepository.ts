import { api } from '@/services/api'
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import type { UserRole } from '@/types/enums'
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api.types'
import type {
  CreateUserRequest,
  UpdateProfileRequest,
  UserListParams,
  UserResponse,
} from '@/types/user.types'

export class HttpUserRepository implements IUserRepository {
  async list(params?: UserListParams) {
    const { data } = await api.get<PaginatedResponse<UserResponse>>('/api/users', {
      params,
    })
    return data
  }

  async getById(id: string) {
    const { data } = await api.get<ApiSuccessResponse<UserResponse>>(`/api/users/${id}`)
    return data
  }

  async create(payload: CreateUserRequest) {
    const { data } = await api.post<ApiSuccessResponse<UserResponse>>('/api/users', payload)
    return data
  }

  async updateProfile(payload: UpdateProfileRequest) {
    const { data } = await api.put<ApiSuccessResponse<UserResponse>>(
      '/api/users/me',
      payload,
    )
    return data
  }

  async updateRole(id: string, role: UserRole) {
    const { data } = await api.put<ApiSuccessResponse<UserResponse>>(
      `/api/users/${id}/role`,
      { role },
    )
    return data
  }

  async setActive(id: string, active: boolean) {
    const { data } = await api.put<ApiSuccessResponse<UserResponse>>(
      `/api/users/${id}/active`,
      { active },
    )
    return data
  }
}
