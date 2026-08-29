import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { cacheTimes, queryKeys } from '@/lib/queryClient'
import { userService } from '@/services/userService'
import type { UserListParams, UserResponse } from '@/types/user.types'
import { INFINITE_MAX_PAGES, INFINITE_PAGE_SIZE } from './useInfiniteRequests'

export type InfiniteUserParams = Omit<UserListParams, 'page' | 'pageSize'>

export function useInfiniteUsers(
  params?: InfiniteUserParams,
  options?: { enabled?: boolean; pageSize?: number; maxPages?: number },
) {
  const pageSize = options?.pageSize ?? INFINITE_PAGE_SIZE
  const maxPages = options?.maxPages ?? INFINITE_MAX_PAGES

  const query = useInfiniteQuery({
    queryKey: queryKeys.usersInfinite({ ...params, pageSize }),
    queryFn: ({ pageParam }) => userService.list({ ...params, page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta?.hasNext ? last.meta.page + 1 : undefined),
    enabled: options?.enabled ?? true,
    ...cacheTimes.userProfile,
  })

  const items = useMemo<UserResponse[]>(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  )

  const loadedPages = query.data?.pages.length ?? 0
  const capReached = loadedPages >= maxPages

  return {
    ...query,
    items,
    totalItems: query.data?.pages[0]?.meta?.totalItems ?? 0,
    capReached: capReached && query.hasNextPage,
    canLoadMore: query.hasNextPage && !capReached,
  }
}
