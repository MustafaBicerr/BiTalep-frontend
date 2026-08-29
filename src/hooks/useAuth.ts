import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cacheTimes, clearSessionCache, queryKeys } from '@/lib/queryClient'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import type { LoginRequest, RegisterRequest } from '@/types/auth.types'
import type { UpdateProfileRequest } from '@/types/user.types'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      clearSessionCache()
      const data = await authService.login(payload)
      setAuth(data.token, data.user, data.refreshToken)
      return data
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      clearSessionCache()
      const data = await authService.register(payload)
      setAuth(data.token, data.user, data.refreshToken)
      return data
    },
  })
}

export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const meQuery = useQuery({
    queryKey: queryKeys.authMe(),
    queryFn: () => authService.getCurrentUser(),
    enabled: Boolean(token),
    ...cacheTimes.userProfile,
  })

  const logout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken
    try {
      await authService.logout(refreshToken)
    } catch {
      /* still clear local session */
    }
    clearAuth()
    clearSessionCache()
  }

  return {
    token,
    user: meQuery.data ?? user,
    isAuthenticated,
    logout,
    meQuery,
  }
}

export function useProfile() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: () => authService.getCurrentUser(),
    enabled: Boolean(token),
    ...cacheTimes.userProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
    onSuccess: (user) => {
      setUser(user)
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.authMe() })
    },
  })
}
