import { repositories } from '@/repositories'
import type { UserRole } from '@/types/enums'
import type { CreateUserRequest, UpdateProfileRequest, UserListParams } from '@/types/user.types'

export const userService = {
  list: (params?: UserListParams) => repositories.users.list(params),
  getUsers: (params?: UserListParams) => repositories.users.list(params),
  getUser: async (id: string) => {
    const res = await repositories.users.getById(id)
    return res.data
  },
  create: async (payload: CreateUserRequest) => {
    const res = await repositories.users.create(payload)
    return res.data
  },
  updateProfile: async (data: UpdateProfileRequest) => {
    const res = await repositories.users.updateProfile(data)
    return res.data
  },
  updateRole: async (id: string, role: UserRole) => {
    const res = await repositories.users.updateRole(id, role)
    return res.data
  },
  setActive: async (id: string, active: boolean) => {
    const res = await repositories.users.setActive(id, active)
    return res.data
  },
}
