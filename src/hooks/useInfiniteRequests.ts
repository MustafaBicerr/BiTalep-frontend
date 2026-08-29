import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { cacheTimes, queryKeys } from '@/lib/queryClient'
import { requestService } from '@/services/requestService'
import type { ApplicationResponse, RequestListParams } from '@/types/request.types'

/** Two screenfuls per page so the prefetch always lands before the user arrives. */
export const INFINITE_PAGE_SIZE = 25
/** Hard stop (~300 rows); past this the UI offers a deep link instead. */
export const INFINITE_MAX_PAGES = 12

export type InfiniteRequestParams = Omit<RequestListParams, 'page' | 'pageSize'>

export function useInfiniteRequests(
  params?: InfiniteRequestParams,
  options?: { enabled?: boolean; pageSize?: number; maxPages?: number },
) {
  const pageSize = options?.pageSize ?? INFINITE_PAGE_SIZE
  const maxPages = options?.maxPages ?? INFINITE_MAX_PAGES

  const query = useInfiniteQuery({
    queryKey: queryKeys.requestsInfinite({ ...params, pageSize }),
    queryFn: ({ pageParam }) => requestService.list({ ...params, page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta?.hasNext ? last.meta.page + 1 : undefined,
    enabled: options?.enabled ?? true,
    ...cacheTimes.requestList,
  })

  const items = useMemo<ApplicationResponse[]>(
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
