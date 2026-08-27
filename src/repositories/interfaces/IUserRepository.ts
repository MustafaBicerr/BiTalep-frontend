import type { UserRole } from '@/types/enums'
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api.types'
import type {
  UpdateProfileRequest,
  UserListParams,
  UserResponse,
} from '@/types/user.types'

export interface IUserRepository {
  list(params?: UserListParams): Promise<PaginatedResponse<UserResponse>>
  getById(id: number): Promise<ApiSuccessResponse<UserResponse>>
  updateProfile(data: UpdateProfileRequest): Promise<ApiSuccessResponse<UserResponse>>
  updateRole(id: number, role: UserRole): Promise<ApiSuccessResponse<UserResponse>>
}
