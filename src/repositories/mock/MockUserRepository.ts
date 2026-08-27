import { MockDelay } from '@/mock/engine/MockDelay'
import { MockErrorInjector } from '@/mock/engine/MockErrorInjector'
import { mockStore } from '@/mock/store/MockStore'
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import type { UserRole } from '@/types/enums'
import type { UpdateProfileRequest, UserListParams } from '@/types/user.types'

export class MockUserRepository implements IUserRepository {
  async list(params?: UserListParams) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return mockStore.listUsers(params)
  }

  async getById(id: number) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.getUserById(id) }
  }

  async updateProfile(data: UpdateProfileRequest) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.updateProfile(data) }
  }

  async updateRole(id: number, role: UserRole) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.updateUserRole(id, role) }
  }
}
