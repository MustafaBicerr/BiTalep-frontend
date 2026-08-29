import { MockDelay } from '@/mock/engine/MockDelay'
import { MockErrorInjector } from '@/mock/engine/MockErrorInjector'
import { mockStore } from '@/mock/store/MockStore'
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import type { UserRole } from '@/types/enums'
import type { UpdateProfileRequest, UserListParams, CreateUserRequest } from '@/types/user.types'
import { mockMailer } from '@/mock/engine/MockMailer'
import { generateInvitePassword } from '@/lib/invitePassword'
import { getPersonnelInviteCopy } from '@/emails/personnelInvite'

export class MockUserRepository implements IUserRepository {
  async list(params?: UserListParams) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return mockStore.listUsers(params)
  }

  async getById(id: string) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.getUserById(id) }
  }

  async create(data: CreateUserRequest) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    const password = generateInvitePassword()
    const entity = mockStore.createUser({
      ...data,
      password,
    })
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    mockMailer.sendPersonnelInvite({
      name: data.name,
      surname: data.surname,
      to: data.email,
      password,
      loginUrl: `${origin}/login`,
      logoUrl: `${origin}/logo-full.png`,
      copy: getPersonnelInviteCopy(`${data.name} ${data.surname}`),
    })
    return { data: mockStore.toUserResponse(entity) }
  }

  async updateProfile(data: UpdateProfileRequest) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.updateProfile(data) }
  }

  async updateRole(id: string, role: UserRole) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.updateUserRole(id, role) }
  }

  async setActive(id: string, active: boolean) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.setUserActive(id, active) }
  }
}
