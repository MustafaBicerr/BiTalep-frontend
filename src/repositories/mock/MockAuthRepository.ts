import { MockDelay } from '@/mock/engine/MockDelay'
import { MockErrorInjector } from '@/mock/engine/MockErrorInjector'
import { mockStore } from '@/mock/store/MockStore'
import type { IAuthRepository } from '@/repositories/interfaces/IAuthRepository'
import { ApiError } from '@/types/api.types'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth.types'
import type { UserResponse } from '@/types/user.types'

export class MockAuthRepository implements IAuthRepository {
  async login(request: LoginRequest) {
    await MockDelay.wait('fast')
    MockErrorInjector.maybeThrow()

    const user = mockStore.findUserByEmail(request.email)
    if (!user || user.password !== request.password) {
      throw new ApiError(401, 'UNAUTHORIZED', 'errors:invalidCredentials')
    }

    const token = mockStore.createSession(user.id)
    const data: LoginResponse = {
      token,
      user: mockStore.toUserResponse(user),
    }
    return { data }
  }

  async register(request: RegisterRequest) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()

    const user = mockStore.createUser({
      name: request.name,
      surname: request.surname,
      email: request.email,
      password: request.password,
    })
    const token = mockStore.createSession(user.id)
    const data: LoginResponse = {
      token,
      user: mockStore.toUserResponse(user),
    }
    return { data }
  }

  async logout(): Promise<void> {
    await MockDelay.wait('fast')
    MockErrorInjector.maybeThrow()
    mockStore.clearSession()
  }

  async getCurrentUser() {
    await MockDelay.wait('fast')
    MockErrorInjector.maybeThrow()
    const user = mockStore.requireCurrentUser()
    const data: UserResponse = mockStore.toUserResponse(user)
    return { data }
  }
}
