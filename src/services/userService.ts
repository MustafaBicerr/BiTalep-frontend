import { repositories } from '@/repositories'
import type { UserRole } from '@/types/enums'
import type { UpdateProfileRequest, UserListParams } from '@/types/user.types'

export const userService = {
  list: (params?: UserListParams) => repositories.users.list(params),
  getUsers: (params?: UserListParams) => repositories.users.list(params),
  getUser: async (id: number) => {
    const res = await repositories.users.getById(id)
    return res.data
  },
  updateProfile: async (data: UpdateProfileRequest) => {
    const res = await repositories.users.updateProfile(data)
    return res.data
  },
  updateRole: async (id: number, role: UserRole) => {
    const res = await repositories.users.updateRole(id, role)
    return res.data
  },
}
