import type { UserRole } from '@/types/enums'
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api.types'
import type {
  CreateUserRequest,
  UpdateProfileRequest,
  UserListParams,
  UserResponse,
} from '@/types/user.types'

export interface IUserRepository {
  list(params?: UserListParams): Promise<PaginatedResponse<UserResponse>>
  getById(id: string): Promise<ApiSuccessResponse<UserResponse>>
  create(data: CreateUserRequest): Promise<ApiSuccessResponse<UserResponse>>
  updateProfile(data: UpdateProfileRequest): Promise<ApiSuccessResponse<UserResponse>>
  updateRole(id: string, role: UserRole): Promise<ApiSuccessResponse<UserResponse>>
}
