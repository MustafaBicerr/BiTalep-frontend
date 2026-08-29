import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cacheTimes, queryKeys } from '@/lib/queryClient'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import type { UpdateProfileRequest } from '@/types/user.types'

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
