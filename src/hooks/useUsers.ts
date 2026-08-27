import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { userService } from '@/services/userService'
import type { UserListParams } from '@/types/user.types'

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => userService.list(params),
    staleTime: 60_000,
  })
}
