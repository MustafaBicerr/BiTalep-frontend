import { QueryClient } from '@tanstack/react-query'

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

export const queryKeys = {
  authMe: ['auth', 'me'] as const,
  requests: (filters?: unknown) => ['requests', filters] as const,
  requestsInfinite: (filters?: unknown) => ['requests', 'infinite', filters] as const,
  request: (id: string) => ['requests', id] as const,
  dashboard: ['dashboard'] as const,
  notifications: (filters?: unknown) => ['notifications', filters] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
  files: (requestId?: string) =>
    requestId != null ? (['files', requestId] as const) : (['files'] as const),
  users: (filters?: unknown) => ['users', filters] as const,
  usersInfinite: (filters?: unknown) => ['users', 'infinite', filters] as const,
  user: (id: string) => ['users', id] as const,
  profile: ['profile'] as const,
  company: ['company'] as const,
  report: (filters?: unknown) => ['reports', filters] as const,
}

export const cacheTimes = {
  requestList: { staleTime: 30_000, gcTime: 5 * 60_000 },
  requestDetail: { staleTime: 60_000, gcTime: 5 * 60_000 },
  dashboard: { staleTime: 60_000, gcTime: 5 * 60_000 },
  userProfile: { staleTime: 5 * 60_000, gcTime: 10 * 60_000 },
  notifications: { staleTime: 30_000, gcTime: 2 * 60_000 },
  report: { staleTime: 60_000, gcTime: 5 * 60_000 },
} as const
