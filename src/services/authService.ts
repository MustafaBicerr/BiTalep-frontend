import { repositories } from '@/repositories'
import type { LoginRequest, RegisterRequest } from '@/types/auth.types'

export const authService = {
  login: async (request: LoginRequest) => {
    const res = await repositories.auth.login(request)
    return res.data
  },
  register: async (request: RegisterRequest) => {
    const res = await repositories.auth.register(request)
    return res.data
  },
  logout: async () => {
    await repositories.auth.logout()
  },
  getCurrentUser: async () => {
    const res = await repositories.auth.getCurrentUser()
    return res.data
  },
  /** Alias used by some hooks */
  me: async () => {
    const res = await repositories.auth.getCurrentUser()
    return res.data
  },
}
