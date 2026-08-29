import { QueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

export function sessionScope(): string {
  return useAuthStore.getState().user?.id ?? 'anon'
}

export function clearSessionCache() {
  queryClient.clear()
}

export const queryKeys = {
  authMe: () => ['auth', 'me', sessionScope()] as const,
  requests: (filters?: unknown) => ['requests', sessionScope(), filters] as const,
  requestsInfinite: (filters?: unknown) =>
    ['requests', 'infinite', sessionScope(), filters] as const,
  request: (id: string) => ['requests', sessionScope(), id] as const,
  dashboard: () => ['dashboard', sessionScope()] as const,
  notifications: (filters?: unknown) => ['notifications', sessionScope(), filters] as const,
  unreadCount: () => ['notifications', 'unread-count', sessionScope()] as const,
  files: (requestId?: string) =>
    requestId != null
      ? (['files', sessionScope(), requestId] as const)
      : (['files', sessionScope()] as const),
  users: (filters?: unknown) => ['users', sessionScope(), filters] as const,
  usersInfinite: (filters?: unknown) => ['users', 'infinite', sessionScope(), filters] as const,
  user: (id: string) => ['users', sessionScope(), id] as const,
  profile: () => ['profile', sessionScope()] as const,
  company: () => ['company', sessionScope()] as const,
  report: (filters?: unknown) => ['reports', sessionScope(), filters] as const,
}

export const cacheTimes = {
  requestList: { staleTime: 30_000, gcTime: 5 * 60_000 },
  requestDetail: { staleTime: 60_000, gcTime: 5 * 60_000 },
  dashboard: { staleTime: 60_000, gcTime: 5 * 60_000 },
  userProfile: { staleTime: 5 * 60_000, gcTime: 10 * 60_000 },
  notifications: { staleTime: 30_000, gcTime: 2 * 60_000 },
  report: { staleTime: 60_000, gcTime: 5 * 60_000 },
} as const
