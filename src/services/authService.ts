import { repositories } from '@/repositories'
import type { ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest } from '@/types/auth.types'

export const authService = {
  login: async (request: LoginRequest) => {
    const res = await repositories.auth.login(request)
    return res.data
  },
  register: async (request: RegisterRequest) => {
    const res = await repositories.auth.register(request)
    return res.data
  },
  logout: async (refreshToken?: string | null) => {
    await repositories.auth.logout(refreshToken)
  },
  getCurrentUser: async () => {
    const res = await repositories.auth.getCurrentUser()
    return res.data
  },
  me: async () => {
    const res = await repositories.auth.getCurrentUser()
    return res.data
  },
  forgotPassword: async (request: ForgotPasswordRequest) => {
    await repositories.auth.forgotPassword(request)
  },
  resetPassword: async (request: ResetPasswordRequest) => {
    await repositories.auth.resetPassword(request)
  },
}
