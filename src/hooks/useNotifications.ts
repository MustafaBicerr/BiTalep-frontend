import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cacheTimes, queryKeys } from '@/lib/queryClient'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/stores/authStore'
import type { NotificationListParams } from '@/types/notification.types'

export function useNotifications(params?: NotificationListParams) {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () => notificationService.getNotifications(params),
    enabled: Boolean(token),
    ...cacheTimes.notifications,
    refetchInterval: 60_000,
  })
}

export function useUnreadCount() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: queryKeys.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    enabled: Boolean(token),
    ...cacheTimes.notifications,
    refetchInterval: 60_000,
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount })
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount })
    },
  })
}
