import { useQuery } from '@tanstack/react-query'
import { cacheTimes, queryKeys } from '@/lib/queryClient'
import { dashboardService } from '@/services/dashboardService'
import { useAuthStore } from '@/stores/authStore'

export function useDashboard() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => dashboardService.getStats(),
    enabled: Boolean(token),
    ...cacheTimes.dashboard,
  })
}
